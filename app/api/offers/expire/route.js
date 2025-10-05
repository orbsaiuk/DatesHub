import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    const toExpire = await writeClient.fetch(
      `*[_type == "offers" && status == "active" && defined(endDate) && endDate < $todayStr]{ _id }`,
      { todayStr }
    );
    const ids = (toExpire || []).map((d) => d._id);
    if (ids.length > 0) {
      const tx = writeClient.transaction();
      ids.forEach((id) => {
        tx.patch(id, (p) =>
          p.set({ status: "inactive", deactivatedAt: new Date().toISOString() })
        );
      });
      await tx.commit();
    }
    return NextResponse.json({ ok: true, updated: ids.length });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
