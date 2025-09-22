import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { writeClient } from "@/sanity/lib/serverClient";
import { USER_COMPANY_MEMBERSHIPS_QUERY } from "@/sanity/queries/company";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const ipBuckets = new Map();

const BOT_UA_RE =
  /bot|crawler|spider|crawling|preview|facebookexternalhit|Slackbot|Twitterbot|WhatsApp|TelegramBot|Discordbot|Google-Structured-Data-Testing-Tool|SemrushBot|AhrefsBot|linkedinbot|pingdom|gtmetrix/i;

function getIp(req) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "0.0.0.0";
}

function rateLimit(ip) {
  const now = Date.now();
  const b = ipBuckets.get(ip) || {
    count: 0,
    resetAt: now + RATE_LIMIT_WINDOW_MS,
  };
  if (now > b.resetAt) {
    b.count = 0;
    b.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  b.count += 1;
  ipBuckets.set(ip, b);
  return b.count <= RATE_LIMIT_MAX;
}

function hashIp(ip) {
  return crypto
    .createHash("sha256")
    .update(ip)
    .digest("base64url")
    .slice(0, 16);
}

export async function POST(req) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (BOT_UA_RE.test(ua)) {
      return NextResponse.json({ ok: true, counted: false, reason: "bot" });
    }

    const ip = getIp(req);
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { id } = body || {};
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Get company
    const found = await writeClient.fetch(
      `*[_type == "company" && (tenantId == $id || slug.current == $id)][0]{ _id, _rev, tenantId, totalViews }`,
      { id }
    );
    if (!found?._id) {
      return NextResponse.json(
        { ok: false, counted: false, reason: "not_found" },
        { status: 404 }
      );
    }

    // Skip members
    const { userId } = await auth();
    if (userId) {
      try {
        const user = await writeClient.fetch(USER_COMPANY_MEMBERSHIPS_QUERY, {
          userId,
        });
        const memberships = Array.isArray(user?.memberships)
          ? user.memberships
          : [];
        const isMember = memberships.some(
          (m) => m?.tenantId === found.tenantId
        );
        if (isMember) {
          return NextResponse.json({
            ok: true,
            counted: false,
            reason: "member",
          });
        }
      } catch {}
    }

    // Deduplication key: tenant + ipHash + day
    const day = new Date().toISOString().slice(0, 10);
    const ipKey = hashIp(ip);
    const dedupeKey = `${found.tenantId || id}:${day}:${ipKey}`;

    // Already viewed? Check in Sanity "views" array
    const alreadyViewed = await writeClient.fetch(
      `*[_type == "company" && _id == $companyId && "${dedupeKey}" in views[].key][0]{ _id }`,
      { companyId: found._id }
    );

    if (alreadyViewed?._id) {
      return NextResponse.json({
        ok: true,
        counted: false,
        reason: "duplicate",
      });
    }

    // Increment + record dedupe key (atomic via revision guard to avoid races)
    try {
      await writeClient
        .patch(found._id)
        .setIfMissing({ totalViews: 0, views: [] })
        .inc({ totalViews: 1 })
        .append("views", [
          { key: dedupeKey, createdAt: new Date().toISOString() },
        ])
        .commit({ autoGenerateArrayKeys: true, ifRevisionID: found._rev });
    } catch (e) {
      // If revision conflict, treat as not counted (another request likely incremented)
      if (e?.statusCode === 409) {
        return NextResponse.json({
          ok: true,
          counted: false,
          reason: "conflict",
        });
      }
      throw e;
    }

    const res = NextResponse.json({ ok: true, counted: true });
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    return res;
  } catch (err) {
    console.error("increment-views error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
