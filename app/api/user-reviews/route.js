import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { UserReviewService } from "@/services/sanity/UserReviewService";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const rawLimit = Number(searchParams.get("limit") || 3);
  const limit = Math.max(1, Math.min(100, rawLimit));
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  if (!id) return new NextResponse("Missing id", { status: 400 });

  try {
    const data = await UserReviewService.listReviews({
      idOrClerkId: id,
      page,
      limit,
    });
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    console.error("GET /api/user-reviews error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { targetUserId, rating, title, content, companyTenantId } =
      body || {};

    if (!targetUserId || typeof rating !== "number") {
      return new NextResponse("Missing fields", { status: 400 });
    }
    const normalizedRating = Math.max(1, Math.min(5, Math.round(rating)));

    // Optionally verify the rater is a company member; best-effort check
    let authorName = "";
    try {
      const author = await writeClient.fetch(
        `*[_type=="user" && clerkId == $uid][0]{ name }`,
        { uid: userId }
      );
      authorName = (author?.name || "").trim();
    } catch (_) {}
    const result = await UserReviewService.createReview({
      targetUserId,
      rating: normalizedRating,
      title,
      content,
      authorName: authorName || "Company",
      companyTenantId,
    });

    if (result?.error) return new NextResponse(result.error, { status: 404 });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("POST /api/user-reviews error", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
