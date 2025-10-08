import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getOrCreateConversation,
  listUserConversations,
} from "@/services/sanity/messaging";
import { rateLimit } from "@/lib/rateLimit";
import { CreateUserConversationSchema } from "@/lib/validation/messaging";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 20);
    const offset = Number(searchParams.get("offset") || 0);
    const rawItems = await listUserConversations({
      clerkId: userId,
      offset,
      limit,
    });

    // Transform data to match frontend expectations
    const items = rawItems.map((conv) => {
      const participantKey = `user:${userId}`;

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
      key: `msg:create:user:${userId}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!rl.allowed)
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 }
      );
    const body = await req.json();
    const parsed = CreateUserConversationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: "invalid_body" },
        { status: 400 }
      );
    const { companyTenantId } = parsed.data;

    const conversation = await getOrCreateConversation({
      conversationType: "user-company",
      participants: [
        { kind: "user", clerkId: userId },
        { kind: "company", tenantId: companyTenantId },
      ],
      tenantContext: { tenantType: "company", tenantId: companyTenantId },
    });
    return NextResponse.json({ ok: true, conversation });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
