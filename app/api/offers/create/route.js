import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { COMPANY_BY_TENANT_QUERY } from "@/sanity/queries/company";
import { SUPPLIER_BY_TENANT_QUERY } from "@/sanity/queries/supplier";

function toPortableText(text) {
  if (!text) return undefined;
  if (Array.isArray(text)) return text;
  return [
    {
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", text: String(text), marks: [] }],
    },
  ];
}

async function ensureUserMembership(userId, tenantType, tenantId) {
  const user = await writeClient.fetch(
    `*[_type == "user" && clerkId == $userId][0]{
      memberships[tenantType == $tenantType && tenantId == $tenantId]{ tenantId }
    }`,
    { userId, tenantType, tenantId }
  );
  return Boolean(user?.memberships?.length);
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Parse body once based on Content-Type
    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    let body = {};
    let fileImageRef = undefined;
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const json = form.get("json");
      const file = form.get("file");
      body = json ? JSON.parse(json) : {};
      if (file && typeof file !== "string") {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const asset = await writeClient.assets.upload("image", buffer, {
          filename: file.name || "offer.jpg",
          contentType: file.type || "image/jpeg",
        });
        fileImageRef = {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        };
      }
    } else {
      body = await req.json().catch(() => ({}));
    }

    const {
      tenantType, // "company" | "supplier"
      tenantId,
      title,
      image,
      status = "active",
      description,
      startDate,
      endDate,
    } = body || {};

    if (!tenantType || !tenantId || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const allowedType = tenantType === "company" || tenantType === "supplier";
    if (!allowedType) {
      return NextResponse.json(
        { error: "Invalid tenantType" },
        { status: 400 }
      );
    }

    const hasAccess = await ensureUserMembership(userId, tenantType, tenantId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Resolve parent document by tenant
    const parent = await writeClient.fetch(
      tenantType === "company"
        ? COMPANY_BY_TENANT_QUERY
        : SUPPLIER_BY_TENANT_QUERY,
      { tenantType, tenantId }
    );
    if (!parent?._id) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Validate dates
    if (startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      if (start < today) {
        return NextResponse.json(
          { error: "Start date cannot be in the past" },
          { status: 400 }
        );
      }
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return NextResponse.json(
          { error: "End date must be on or after start date" },
          { status: 400 }
        );
      }
    }

    const offerDoc = {
      _type: "offers",
      tenantType,
      tenantId,
      title: String(title).slice(0, 200),
      image: fileImageRef || image,
      status: status === "inactive" ? "inactive" : "active",
      description: toPortableText(description),
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      [tenantType]: { _type: "reference", _ref: parent._id },
      createdAt: new Date().toISOString(),
    };

    const created = await writeClient.create(offerDoc);

    // Append reference to parent offers[] (best-effort)
    try {
      await writeClient
        .patch(parent._id)
        .setIfMissing({ offers: [] })
        .append("offers", [{ _type: "reference", _ref: created._id }])
        .commit({ autoGenerateArrayKeys: true });
    } catch (_) {
      // non-fatal
    }

    return NextResponse.json({ ok: true, offer: created });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
