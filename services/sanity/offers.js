import { writeClient } from "@/sanity/lib/serverClient";
import {
  OFFERS_BY_TENANT_QUERY,
  OFFER_STATS_BY_TENANT_QUERY,
} from "@/sanity/queries/offer";

export async function getOffersForTenant(tenantType, tenantId) {
  let [items, stats] = await Promise.all([
    writeClient.fetch(OFFERS_BY_TENANT_QUERY, { tenantType, tenantId }),
    writeClient.fetch(OFFER_STATS_BY_TENANT_QUERY, { tenantType, tenantId }),
  ]);
  // Auto-deactivate offers whose endDate has passed
  try {
    const nowIso = new Date().toISOString();
    const expired = (items || []).filter(
      (o) => o?.status === "active" && o?.endDate && o.endDate < nowIso
    );
    if (expired.length > 0) {
      const tx = writeClient.transaction();
      expired.forEach((o) => {
        tx.patch(o._id, (p) =>
          p.set({ status: "inactive", deactivatedAt: new Date().toISOString() })
        );
      });
      await tx.commit();
      // Reflect changes locally without an extra fetch
      items = items.map((o) =>
        expired.find((e) => e._id === o._id)
          ? {
              ...o,
              status: "inactive",
              deactivatedAt: new Date().toISOString(),
            }
          : o
      );
      // Update stats locally
      stats = {
        ...stats,
        active: Math.max(0, (stats?.active ?? 0) - expired.length),
        inactive: (stats?.inactive ?? 0) + expired.length,
      };
    }
  } catch (_) {
    // best-effort; ignore errors
  }

  // Auto-delete offers inactive for > 3 days
  try {
    const now = Date.now();
    const toDelete = (items || []).filter((o) => {
      if (o?.status !== "inactive" || !o?.deactivatedAt) return false;
      const t = Date.parse(o.deactivatedAt);
      if (Number.isNaN(t)) return false;
      const ageMs = now - t;
      return ageMs > 3 * 24 * 60 * 60 * 1000;
    });
    if (toDelete.length > 0) {
      const tx = writeClient.transaction();
      toDelete.forEach((o) => tx.delete(o._id));
      await tx.commit();
      // Remove locally and adjust stats
      const deleteIds = new Set(toDelete.map((o) => o._id));
      items = items.filter((o) => !deleteIds.has(o._id));
      stats = {
        ...stats,
        total: Math.max(0, (stats?.total ?? 0) - toDelete.length),
        inactive: Math.max(0, (stats?.inactive ?? 0) - toDelete.length),
      };
    }
  } catch (_) {
    // best-effort; ignore errors
  }
  return { items, stats };
}

export async function getCompanyOffers(tenantId) {
  return getOffersForTenant("company", tenantId);
}

export async function getSupplierOffers(tenantId) {
  return getOffersForTenant("supplier", tenantId);
}
