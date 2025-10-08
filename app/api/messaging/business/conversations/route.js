import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getOrCreateConversation,
  listTenantConversations,
} from "@/services/sanity/messaging";
import { writeClient } from "@/sanity/lib/serverClient";
import { USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY } from "@/sanity/queries/user";
import { rateLimit } from "@/lib/rateLimit";
import { CreateBusinessConversationSchema } from "@/lib/validation/messaging";

async function ensureMembership(userId, tenantType, tenantId) {
  const profile = await writeClient.fetch(
    USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY,
    { userId }
  );
  const memberships = profile?.memberships || [];
  return memberships.some(
    (m) => m?.tenantType === tenantType && m?.tenantId === tenantId
  );
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    const { searchParams } = new URL(req.url);
    const tenantType = searchParams.get("tenantType");
    const tenantId = searchParams.get("tenantId");
    const limit = Number(searchParams.get("limit") || 20);
    const offset = Number(searchParams.get("offset") || 0);

    if (!tenantType || !tenantId)
      return NextResponse.json(
        { ok: false, error: "tenantType and tenantId required" },
        { status: 400 }
      );

    const isMember = await ensureMembership(userId, tenantType, tenantId);
    if (!isMember)
      return NextResponse.json(
        { ok: false, error: "forbidden" },
        { status: 403 }
      );

    const rawItems = await listTenantConversations({
      tenantType,
      tenantId,
      offset,
      limit,
    });

    // Transform data to match frontend expectations
    const items = rawItems.map((conv) => {
      const participantKey = `${tenantType}:${tenantId}`;

      // Build participants array
      const participants = [];
      if (conv.participant1Data) {
        participants.push({
          kind: conv.participant1Data._type,
          tenantId: conv.participant1Data.tenantId,
          clerkId: conv.participant1Data.clerkId,
          displayName: conv.participant1Data.name,
          name: conv.participant1Data.name,
          avatar: conv.participant1Data.image || conv.participant1Data.logo,
        });
      }
      if (conv.participant2Data) {
        participants.push({
          kind: conv.participant2Data._type,
          tenantId: conv.participant2Data.tenantId,
          clerkId: conv.participant2Data.clerkId,
          displayName: conv.participant2Data.name,
          name: conv.participant2Data.name,
          avatar: conv.participant2Data.image || conv.participant2Data.logo,
        });
      }

      // Build unread array (legacy format for frontend)
      const unread = [
        {
          participantKey,
          count: conv.unreadCount || 0,
        },
      ];

      return {
        ...conv,
        participants,
        unread,
        // Use lastMessagePreview from query if available, otherwise fallback to lastMessage.text
        lastMessagePreview: conv.lastMessagePreview || conv.lastMessage?.text || "",
        lastMessageAt: conv.lastMessageAt || conv.lastMessage?.createdAt || conv.createdAt,
      };
    });

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    const rl = rateLimit({
      key: `msg:create:biz:${userId}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!rl.allowed)
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 }
      );
    const body = await req.json();
    const parsed = CreateBusinessConversationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: "invalid_body" },
        { status: 400 }
      );
    const { tenantType, tenantId, counterpartType, counterpartTenantId } =
      parsed.data;

    const isMember = await ensureMembership(userId, tenantType, tenantId);
    if (!isMember)
      return NextResponse.json(
        { ok: false, error: "forbidden" },
        { status: 403 }
      );

    // Get the business document IDs
    const business1 = await writeClient.fetch(
      `*[_type in ["company", "supplier"] && tenantId == $tenantId][0]`,
      { tenantId }
    );

    const business2 = await writeClient.fetch(
      `*[_type in ["company", "supplier"] && tenantId == $counterpartTenantId][0]`,
      { counterpartTenantId: counterpartTenantId }
    );

    if (!business1?._id || !business2?._id) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    const conversation = await getOrCreateConversation({
      participant1: business1._id,
      participant2: business2._id,
    });
    return NextResponse.json({ ok: true, conversation });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
