import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSupplier } from "@/services/sanity/entities";
import {
  getCurrentSubscription,
  getAllPlans,
} from "@/services/sanity/subscriptions";
import PackagesPage from "@/app/business/_components/packages/PackagesPage";

export const metadata = {
  title: "الباقات والاشتراكات",
  description:
    "إدارة باقة الاشتراك، ترقية الباقة، عرض الميزات المتاحة، والفواتير",
  robots: { index: false, follow: false },
};

export const revalidate = 0; // Disable caching for this page

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
