import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { COMPANY_BY_TENANTID_OR_SLUG_QUERY } from "@/sanity/queries/company";

async function getAuthorNameByClerkId(clerkId) {
  try {
    const data = await writeClient.fetch(
      `*[_type=="user" && clerkId == $uid][0]{ name }`,
      { uid: clerkId }
    );
    return (data?.name || "").trim();
  } catch (_) {
    return "";
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { companyId, rating, title, content } = body || {};

    if (!companyId || typeof rating !== "number") {
      return new NextResponse("Missing fields", { status: 400 });
    }
    const normalizedRating = Math.max(1, Math.min(5, Math.round(rating)));

    // Resolve company by tenantId or slug
    const company = await writeClient.fetch(
      `*[_type == "company" && (tenantId == $id || slug.current == $id)][0]{ _id, rating, ratingCount, tenantId }`,
      { id: companyId }
    );
    if (!company?._id)
      return new NextResponse("Company not found", { status: 404 });

    const authorName = await getAuthorNameByClerkId(userId);

    const reviewDoc = {
      _type: "review",
      tenantType: "company",
      tenantId: company.tenantId || companyId,
      company: { _type: "reference", _ref: company._id },
      rating: normalizedRating,
      title: (title || "").slice(0, 140),
      content: (content || "").slice(0, 5000),
      authorName: authorName || "Anonymous",
      createdAt: new Date().toISOString(),
    };

    const created = await writeClient.create(reviewDoc);

    // Update aggregates (simple incremental calculation)
    const prevAvg = Number(company.rating || 0);
    const prevCount = Number(company.ratingCount || 0);
    const newCount = prevCount + 1;
    const newAvg = Number(
      ((prevAvg * prevCount + normalizedRating) / newCount).toFixed(2)
    );

    await writeClient
      .patch(company._id)
      .set({ rating: newAvg, ratingCount: newCount })
      .commit();

    return NextResponse.json({
      ok: true,
      reviewId: created._id,
      rating: newAvg,
      ratingCount: newCount,
    });
  } catch (err) {
    console.error("Failed to create review", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
