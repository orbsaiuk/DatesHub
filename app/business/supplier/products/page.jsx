import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSupplier } from "@/services/sanity/entities";
import { getSupplierProducts } from "@/services/sanity/products";
import ProductsPage from "@/app/business/_components/products/ProductsPage";

export default async function SupplierProductsPage() {
    const { userId } = await auth();
    if (!userId) {
        return redirect("/sign-in?redirect_url=/business/supplier/products");
    }
    const membership = await getUserSupplier(userId);
    const tenantId = membership?.tenantId;
    if (!tenantId) return redirect("/become");

    const { items, stats } = await getSupplierProducts(tenantId);

    return (
        <ProductsPage
            tenantType="supplier"
            tenantId={tenantId}
            items={items}
            stats={stats}
        />
    );
}