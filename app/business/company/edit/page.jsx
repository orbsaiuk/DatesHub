import { auth } from "@clerk/nextjs/server";
import { getUserCompany, getCompanyEditData } from "@/services/sanity/entities";
import { redirect } from "next/navigation";
import EditPageClient from "../../_components/edit/EditPageClient";

export default async function CompanyEditPage() {
  const { userId } = await auth();
  const membership = await getUserCompany(userId);
  const tenantId = membership?.tenantId;
  const company = await getCompanyEditData(tenantId);
  
  if (!userId) {
    redirect("/sign-in?redirect_url=/business/company/edit");
  }

  if (!tenantId) {
    redirect("/become");
  }


  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Edit Profile
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Update your company information and settings
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <EditPageClient initialEntity={company} entityType="company" />
    </div>
  );
}
