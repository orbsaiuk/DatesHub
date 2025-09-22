import OffersClient from "@/app/business/_components/offers/OffersClient";

export default function OffersPage({ tenantType, tenantId, items, stats }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Offers</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Create and manage your service offers
          </p>
        </div>
      </div>

      <OffersClient
        tenantType={tenantType}
        tenantId={tenantId}
        items={items}
        onChanged={undefined}
      />
    </div>
  );
}
