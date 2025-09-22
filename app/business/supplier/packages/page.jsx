import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSupplier } from "@/services/sanity/entities";
import {
  getCurrentSubscription,
  getAllPlans,
} from "@/services/sanity/subscriptions";
import PackagesPage from "@/app/business/_components/packages/PackagesPage";

export default async function SupplierPackagesPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await getUserSupplier(userId);
  const tenantId = membership?.tenantId;
  if (!tenantId) return redirect("/become");

  // Fetch subscription and plan data
  const [currentSubscription, allPlans] = await Promise.all([
    getCurrentSubscription("supplier", tenantId),
    getAllPlans(),
  ]);

  return (
    <PackagesPage
      tenantType="supplier"
      tenantId={tenantId}
      currentSubscription={currentSubscription}
      allPlans={allPlans}
    />
  );
}
