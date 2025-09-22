"use client";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import AddOfferDialog from "./AddOfferDialog";
import OffersClient from "./OffersClient";

export default function OffersManager({ tenantType, tenantId, items, stats }) {
  const [offers, setOffers] = useState(items || []);

  // Sync when server props change (e.g., after router.refresh() from child actions)
  useEffect(() => {
    setOffers(items || []);
  }, [items]);

  // Derive stats from current offers for instant UI updates on create
  const derived = useMemo(() => {
    const total = offers.length;
    const active = offers.reduce(
      (acc, o) => acc + (o.status === "active" ? 1 : 0),
      0
    );
    const inactive = total - active;
    return { total, active, inactive };
  }, [offers]);

  const handleCreated = (offer) => {
    // Append the newly created offer for immediate feedback
    setOffers((prev) => [...prev, offer]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Offers</h1>
          <p className="text-muted-foreground">
            Create and manage your service offers
          </p>
        </div>
        <AddOfferDialog
          tenantType={tenantType}
          tenantId={tenantId}
          triggerClassName="inline-flex items-center cursor-pointer"
          onCreated={handleCreated}
        />
      </div>

      <div className="flex gap-2 text-sm">
        <Badge variant="outline">Total: {derived.total}</Badge>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Active: {derived.active}
        </Badge>
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          Inactive: {derived.inactive}
        </Badge>
      </div>

      <OffersClient
        tenantType={tenantType}
        tenantId={tenantId}
        items={offers}
        onChanged={undefined}
      />
    </div>
  );
}
