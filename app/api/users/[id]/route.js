import { NextResponse } from "next/server";
import { UserReviewService } from "@/services/sanity/UserReviewService";

export async function GET(_req, { params }) {
  const id = (await params)?.id;
  if (!id) return new NextResponse("Missing id", { status: 400 });

  try {
    // Allow either Sanity _id or Clerk userId
    const user = await UserReviewService.getPublicProfile(id);

    if (!user) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("GET /api/users/[id] error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
