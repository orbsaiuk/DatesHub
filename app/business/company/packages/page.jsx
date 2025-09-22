import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCompany } from "@/services/sanity/entities";
import {
  getCurrentSubscription,
  getAllPlans,
} from "@/services/sanity/subscriptions";
import PackagesPage from "@/app/business/_components/packages/PackagesPage";

export default async function CompanyPackagesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await getUserCompany(userId);
  const tenantId = membership?.tenantId;
  if (!tenantId) return redirect("/become");

  // Fetch subscription and plan data
  const [currentSubscription, allPlans] = await Promise.all([
    getCurrentSubscription("company", tenantId),
    getAllPlans(),
  ]);

  return (
    <PackagesPage
      tenantType="company"
      tenantId={tenantId}
      currentSubscription={currentSubscription}
      allPlans={allPlans}
    />
  );
}
