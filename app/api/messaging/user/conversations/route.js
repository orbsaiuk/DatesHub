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
    const items = await listUserConversations({
      clerkId: userId,
      offset,
      limit,
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
