import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSupplier, getSupplierData } from "@/services/sanity/entities";
import { getCurrentSubscription } from "@/services/sanity/subscriptions";
import WelcomeSection from "../../_components/dashboard/WelcomeSection";
import QuickStats from "../../_components/dashboard/QuickStats";
import ProfileHealth from "../../_components/dashboard/ProfileHealth";
import ActivityReport from "../../_components/dashboard/ActivityReport";

export const metadata = {
  title: "لوحة التحكم",
  description:
    "لوحة التحكم المورد - إدارة ملفك الشخصي، المنتجات، العروض، والرسائل..الخ",
  robots: { index: false, follow: false },
};

export default async function SupplierDashboardPage() {
  const { userId } = await auth();
  const membership = await getUserSupplier(userId);
  const tenantId = membership?.tenantId;
  const entityData = await getSupplierData(tenantId);

  if (!userId) {
    return redirect("/sign-in?redirect_url=/business/supplier/dashboard");
  }

  if (!tenantId) {
    return redirect("/become");
  }

  // Fetch subscription data
  const subscription = await getCurrentSubscription("supplier", tenantId);

  return (
    <div className="space-y-6 sm:space-y-8 p-4 md:p-6">
      <WelcomeSection
        entity={entityData}
        entityType="supplier"
        subscription={subscription}
      />
      <QuickStats
        entity={entityData}
        entityType="supplier"
        subscription={subscription}
      />
      <ProfileHealth entity={entityData} entityType="supplier" />
      <ActivityReport entity={entityData} entityType="supplier" />
    </div>
  );
}
