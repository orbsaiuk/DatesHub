import { writeClient } from "@/sanity/lib/serverClient";
import {
  USER_PUBLIC_PROFILE_BY_ID_OR_CLERKID,
  USER_RESOLVE_TENANT_KEY,
  USER_REVIEWS_PAGE,
  USER_REVIEWS_COUNT,
} from "@/sanity/queries/userReviews";

export class UserReviewService {
  static async getPublicProfile(idOrClerkId) {
    return await writeClient.fetch(USER_PUBLIC_PROFILE_BY_ID_OR_CLERKID, {
      id: idOrClerkId,
    });
  }

  static async resolveTenantKey(idOrClerkId) {
    const doc = await writeClient.fetch(USER_RESOLVE_TENANT_KEY, {
      id: idOrClerkId,
    });
    return doc?.clerkId || idOrClerkId;
  }

  static async listReviews({ idOrClerkId, page = 1, limit = 20 }) {
    const tenantId = await this.resolveTenantKey(idOrClerkId);
    const safeLimit = Math.max(1, Math.min(100, Number(limit)));
    const safePage = Math.max(1, Number(page));
    const start = (safePage - 1) * safeLimit;
    const end = start + safeLimit;

    const [items, count] = await Promise.all([
      writeClient.fetch(USER_REVIEWS_PAGE, {
        tenantId,
        start,
        end,
      }),
      writeClient.fetch(USER_REVIEWS_COUNT, { tenantId }),
    ]);

    const total = Number(count || 0);
    const pageCount = Math.max(1, Math.ceil(total / safeLimit));
    return {
      items: items || [],
      count: total,
      page: safePage,
      pageCount,
      limit: safeLimit,
    };
  }

  static async createReview({
    targetUserId,
    rating,
    title,
    content,
    authorName,
    companyTenantId,
  }) {
    const normalizedRating = Math.max(
      1,
      Math.min(5, Math.round(Number(rating)))
    );

    // Resolve target user and existing aggregates
    const target = await writeClient.fetch(
      `*[_type == "user" && (_id == $id || clerkId == $id)][0]{ _id, rating, ratingCount, clerkId }`,
      { id: targetUserId }
    );
    if (!target?._id) return { error: "User not found" };

    const reviewDoc = {
      _type: "review",
      tenantType: "user",
      tenantId: target.clerkId || targetUserId,
      rating: normalizedRating,
      title: (title || "").slice(0, 140),
      content: (content || "").slice(0, 5000),
      authorName: (authorName || "Company").slice(0, 140),
      createdAt: new Date().toISOString(),
      companyTenantId: companyTenantId || null,
      user: { _type: "reference", _ref: target._id },
    };

    const created = await writeClient.create(reviewDoc);

    // Update aggregates on user
    const prevAvg = Number(target.rating || 0);
    const prevCount = Number(target.ratingCount || 0);
    const newCount = prevCount + 1;
    const newAvg = Number(
      ((prevAvg * prevCount + normalizedRating) / newCount).toFixed(2)
    );

    await writeClient
      .patch(target._id)
      .set({ rating: newAvg, ratingCount: newCount })
      .commit();

    return {
      ok: true,
      reviewId: created._id,
      rating: newAvg,
      ratingCount: newCount,
    };
  }
}
