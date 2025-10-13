import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSupplier } from "@/services/sanity/entities";
import { getSupplierOffers } from "@/services/sanity/offers";
import OffersPage from "@/app/business/_components/offers/OffersPage";

export const metadata = {
  title: "إدارة العروض",
  description:
    "إدارة عروض المورد، إضافة عروض جديدة، تعديل العروض الموجودة، وحذف العروض",
  robots: { index: false, follow: false },
};

export default async function SupplierOffersPage() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in?redirect_url=/business/supplier/offers");
  }
  const membership = await getUserSupplier(userId);
  const tenantId = membership?.tenantId;
  if (!tenantId) return redirect("/become");

  const { items, stats } = await getSupplierOffers(tenantId);

  return (
    <OffersPage
      tenantType="supplier"
      tenantId={tenantId}
      items={items}
      stats={stats}
    />
  );
}
