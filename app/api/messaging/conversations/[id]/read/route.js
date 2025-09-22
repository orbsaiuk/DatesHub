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
    const conv = await writeClient.getDocument(conversationId);
    if (!conv)
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 }
      );

    // resolve participant identity: prefer business membership if present
    const userProfile = await writeClient.fetch(
      `*[_type=="user" && clerkId==$uid][0]{memberships}`,
      { uid: userId }
    );
    const memberships = userProfile?.memberships || [];
    let participant = { kind: "user", clerkId: userId };
    for (const p of conv.participants || []) {
      if (
        p.kind !== "user" &&
        memberships.some(
          (m) => m.tenantType === p.kind && m.tenantId === p.tenantId
        )
      ) {
        participant = { kind: p.kind, tenantId: p.tenantId };
        break;
      }
    }

    const result = await markConversationRead({ conversationId, participant });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
