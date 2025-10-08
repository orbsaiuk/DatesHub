import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listMessages, sendMessage } from "@/services/sanity/messaging";
import { writeClient } from "@/sanity/lib/serverClient";
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
    const rawItems = await listMessages({
      conversationId,
      before,
      limit,
      offset,
    });

    // Transform messages to match frontend expectations
    const items = rawItems.map((msg) => ({
      ...msg,
      sender: msg.senderData
        ? {
          kind: msg.senderData._type,
          clerkId: msg.senderData.clerkId,
          tenantId: msg.senderData.tenantId,
          name: msg.senderData.name,
          image: msg.senderData.image,
          logo: msg.senderData.logo,
        }
        : null,
    }));

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
    const body = await req.json();
    const parsed = SendMessageSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: "invalid_body" },
        { status: 400 }
      );
    const { text } = parsed.data;

    const conv = await writeClient.fetch(
      `*[_type == "conversation" && _id == $conversationId][0]{
        participant1, participant2,
        "participant1Data": participant1->{_type, tenantId, name},
        "participant2Data": participant2->{_type, tenantId, name}
      }`,
      { conversationId }
    );

    // Define sender from auth context
    let sender = { kind: "user", clerkId: userId };

    // If user belongs to one of the business participants, prefer that identity
    const userProfile = await writeClient.fetch(
      `*[_type=="user" && clerkId==$uid][0]{memberships}`,
      { uid: userId }
    );
    const memberships = userProfile?.memberships || [];

    // Check if user is a member of either participant business
    if (conv.participant1Data && conv.participant1Data._type !== "user") {
      const isMember = memberships.some(
        (m) =>
          m.tenantType === conv.participant1Data._type &&
          m.tenantId === conv.participant1Data.tenantId
      );
      if (isMember) {
        sender = {
          kind: conv.participant1Data._type,
          tenantId: conv.participant1Data.tenantId,
        };
      }
    }

    if (conv.participant2Data && conv.participant2Data._type !== "user") {
      const isMember = memberships.some(
        (m) =>
          m.tenantType === conv.participant2Data._type &&
          m.tenantId === conv.participant2Data.tenantId
      );
      if (isMember) {
        sender = {
          kind: conv.participant2Data._type,
          tenantId: conv.participant2Data.tenantId,
        };
      }
    }

    const rawMessage = await sendMessage({
      conversationId,
      sender,
      text,
    });

    // Transform message to match frontend expectations
    const message = {
      ...rawMessage,
      sender: sender
        ? {
          kind: sender.kind,
          clerkId: sender.clerkId,
          tenantId: sender.tenantId,
        }
        : null,
    };

    return NextResponse.json({ ok: true, message });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
