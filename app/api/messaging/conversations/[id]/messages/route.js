import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listMessages, sendMessage } from "@/services/sanity/messaging";
import { writeClient } from "@/sanity/lib/serverClient";
import { rateLimit } from "@/lib/rateLimit";
import { SendMessageSchema } from "@/lib/validation/messaging";
import { canAccessConversation } from "@/lib/auth/authorization";

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    const resolvedParams = await params;
    const conversationId = resolvedParams?.id;
    if (!(await canAccessConversation(userId, conversationId)))
      return NextResponse.json(
        { ok: false, error: "forbidden" },
        { status: 403 }
      );

    const { searchParams } = new URL(req.url);
    const before = searchParams.get("before") || new Date().toISOString();
    const limit = Number(searchParams.get("limit") || 30);
    const offset = Number(searchParams.get("offset") || 0);
    const items = await listMessages({ conversationId, before, limit, offset });
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    const resolvedParams = await params;
    const conversationId = resolvedParams?.id;
    if (!(await canAccessConversation(userId, conversationId)))
      return NextResponse.json(
        { ok: false, error: "forbidden" },
        { status: 403 }
      );
    const rl = rateLimit({
      key: `msg:send:${userId}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!rl.allowed)
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 }
      );
    const body = await req.json();
    const parsed = SendMessageSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: "invalid_body" },
        { status: 400 }
      );
    const { text } = parsed.data;

    const conv = await writeClient.getDocument(conversationId);
    // Define sender from auth context
    let sender = { kind: "user", clerkId: userId };
    // If user belongs to one of the business participants, prefer that identity
    const userProfile = await writeClient.fetch(
      `*[_type=="user" && clerkId==$uid][0]{memberships}`,
      { uid: userId }
    );
    const memberships = userProfile?.memberships || [];
    for (const p of conv.participants || []) {
      if (
        p.kind !== "user" &&
        memberships.some(
          (m) => m.tenantType === p.kind && m.tenantId === p.tenantId
        )
      ) {
        sender = { kind: p.kind, tenantId: p.tenantId };
        break;
      }
    }

    const message = await sendMessage({
      conversationId,
      sender,
      text,
    });
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
