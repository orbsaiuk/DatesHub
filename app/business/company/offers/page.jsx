import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCompany } from "@/services/sanity/entities";
import { getCompanyOffers } from "@/services/sanity/offers";
import OffersPage from "@/app/business/_components/offers/OffersPage";

export const metadata = {
  title: "إدارة العروض",
  description:
    "إدارة عروض الشركة، إضافة عروض جديدة، تعديل العروض الموجودة، وحذف العروض",
  robots: { index: false, follow: false },
};

export default async function CompanyOffersPage() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in?redirect_url=/business/company/offers");
  }
  const membership = await getUserCompany(userId);
  const tenantId = membership?.tenantId;
  if (!tenantId) return redirect("/become");

  const { items, stats } = await getCompanyOffers(tenantId);

  return (
    <OffersPage
      tenantType="company"
      tenantId={tenantId}
      items={items}
      stats={stats}
    />
  );
}
