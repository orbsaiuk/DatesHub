import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !status)
    return NextResponse.json({ error: "Missing" }, { status: 400 });
  try {
    // Prevent activating expired offers (endDate in the past)
    if (status === "active") {
      const offer = await writeClient.fetch(
        `*[_type == "offers" && _id == $id][0]{ endDate }`,
        { id }
      );
      if (offer?.endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(offer.endDate);
        end.setHours(0, 0, 0, 0);
        if (end < today) {
          return NextResponse.json(
            { error: "Offer has expired and cannot be activated" },
            { status: 400 }
          );
        }
      }
    }
    const patch = writeClient.patch(id).set({ status });
    if (status === "inactive") {
      patch.set({ deactivatedAt: new Date().toISOString() });
    } else {
      patch.unset(["deactivatedAt"]);
    }
    await patch.commit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
