import ProductsClient from "@/app/business/_components/products/ProductsClient";

export default function ProductsPage({ tenantType, tenantId, items }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">المنتجات</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            إنشاء وإدارة منتجاتك
          </p>
        </div>
      </div>

      <ProductsClient
        tenantType={tenantType}
        tenantId={tenantId}
        items={items}
        onChanged={undefined}
      />
    </div>
  );
}
