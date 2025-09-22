import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUnreadForTenant } from "@/services/sanity/messagingCounts";
import { writeClient } from "@/sanity/lib/serverClient";
import { USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY } from "@/sanity/queries/user";

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
    if (!tenantType || !tenantId)
      return NextResponse.json(
        { ok: false, error: "bad_request" },
        { status: 400 }
      );

    // Verify membership
    const profile = await writeClient.fetch(
      USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY,
      { userId }
    );
    const memberships = profile?.memberships || [];
    const isMember = memberships.some(
      (m) => m?.tenantType === tenantType && m?.tenantId === tenantId
    );
    if (!isMember)
      return NextResponse.json(
        { ok: false, error: "forbidden" },
        { status: 403 }
      );

    const count = await getUnreadForTenant({ tenantType, tenantId });
    return NextResponse.json({ ok: true, count });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
