import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCompany } from "@/services/sanity/entities";
import { getCompanyProducts } from "@/services/sanity/products";
import ProductsPage from "@/app/business/_components/products/ProductsPage";

export default async function CompanyProductsPage() {
    const { userId } = await auth();
    if (!userId) {
        return redirect("/sign-in?redirect_url=/business/company/products");
    }
    const membership = await getUserCompany(userId);
    const tenantId = membership?.tenantId;
    if (!tenantId) return redirect("/become");

    const { items, stats } = await getCompanyProducts(tenantId);

    return (
        <ProductsPage
            tenantType="company"
            tenantId={tenantId}
            items={items}
            stats={stats}
        />
    );
}