import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCompany, getCompanyData } from "@/services/sanity/entities";
import { getCurrentSubscription } from "@/services/sanity/subscriptions";
import WelcomeSection from "../../_components/dashboard/WelcomeSection";
import QuickStats from "../../_components/dashboard/QuickStats";
import ProfileHealth from "../../_components/dashboard/ProfileHealth";
import ActivityReport from "../../_components/dashboard/ActivityReport";

export default async function CompanyDashboardPage() {
  const { userId } = await auth();
  const membership = await getUserCompany(userId);
  const tenantId = membership?.tenantId;
  const entityData = await getCompanyData(tenantId);

  if (!userId) {
    return redirect("/sign-in?redirect_url=/business/company/dashboard");
  }

  if (!tenantId) {
    return redirect("/become");
  }

  // Fetch subscription data
  const subscription = await getCurrentSubscription("company", tenantId);

  return (
    <div className="space-y-6 sm:space-y-8 p-4 md:p-6">
      <WelcomeSection
        entity={entityData}
        entityType="company"
        subscription={subscription}
      />
      <QuickStats
        entity={entityData}
        entityType="company"
        subscription={subscription}
      />
      <ProfileHealth entity={entityData} entityType="company" />
      <ActivityReport entity={entityData} entityType="company" />
    </div>
  );
}
