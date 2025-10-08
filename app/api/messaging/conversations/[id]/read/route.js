import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { markConversationRead } from "@/services/sanity/messaging";
import { writeClient } from "@/sanity/lib/serverClient";

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    const conversationId = (await params)?.id;

    // Fetch conversation with participant details
    const conv = await writeClient.fetch(
      `*[_type == "conversation" && _id == $conversationId][0]{
        _id,
        "participant1Data": participant1->{_id, _type, clerkId, tenantId},
        "participant2Data": participant2->{_id, _type, clerkId, tenantId}
      }`,
      { conversationId }
    );

    if (!conv)
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 }
      );

    // Resolve participant identity: prefer business membership if present
    const userProfile = await writeClient.fetch(
      `*[_type=="user" && clerkId==$uid][0]{memberships}`,
      { uid: userId }
    );
    const memberships = userProfile?.memberships || [];
    let participant = { kind: "user", clerkId: userId };

    // Check if user is a member of participant1 business
    if (
      conv.participant1Data?._type !== "user" &&
      memberships.some(
        (m) =>
          m.tenantType === conv.participant1Data._type &&
          m.tenantId === conv.participant1Data.tenantId
      )
    ) {
      participant = {
        kind: conv.participant1Data._type,
        tenantId: conv.participant1Data.tenantId,
      };
    }
    // Check if user is a member of participant2 business
    else if (
      conv.participant2Data?._type !== "user" &&
      memberships.some(
        (m) =>
          m.tenantType === conv.participant2Data._type &&
          m.tenantId === conv.participant2Data.tenantId
      )
    ) {
      participant = {
        kind: conv.participant2Data._type,
        tenantId: conv.participant2Data.tenantId,
      };
    }

    const result = await markConversationRead({ conversationId, participant });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
