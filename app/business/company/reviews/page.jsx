import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import {
  USER_COMPANY_MEMBERSHIPS_QUERY,
  COMPANY_REVIEWS_QUERY,
} from "@/sanity/queries/company";
import { redirect } from "next/navigation";
import ReviewsHeader from "./_components/ReviewsHeader";
import RatingBreakdown from "./_components/RatingBreakdown";
import ReviewsList from "./_components/ReviewsList";

async function getUserCompany(userId) {
  const user = await writeClient.fetch(USER_COMPANY_MEMBERSHIPS_QUERY, {
    userId,
  });
  return user?.memberships?.[0]; // Get first company membership
}

async function getCompanyReviews(tenantId) {
  return await writeClient.fetch(COMPANY_REVIEWS_QUERY, { tenantId });
}

export default async function CompanyReviewsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await getUserCompany(userId);
  if (!membership?.company) {
    redirect("/become");
  }

  const company = await getCompanyReviews(membership.tenantId);
  if (!company) {
    redirect("/become");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <ReviewsHeader company={company} />

      {/* Rating Breakdown */}
      <RatingBreakdown
        reviews={company.reviews || []}
        total={company.ratingCount || 0}
      />

      {/* Reviews List */}
      <ReviewsList reviews={company.reviews || []} />
    </div>
  );
}
