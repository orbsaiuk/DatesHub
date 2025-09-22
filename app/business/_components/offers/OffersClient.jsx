"use client";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import OfferSearchFilters from "./OfferSearchFilters";
import OfferTableView from "./OfferTableView";
import OfferCardView from "./OfferCardView";
import OfferPagination from "./OfferPagination";
import AddOfferDialog from "@/app/business/_components/offers/AddOfferDialog";
import { Badge } from "@/components/ui/badge";

export default function OffersClient({
  tenantType,
  tenantId,
  items,
  onChanged,
}) {
  // Simple state; avoid optimistic local updates
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [pending, setPending] = useState({ id: null, type: null });
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Computed stats from current items
  const stats = useMemo(() => {
    const total = (items || []).length;
    const active = (items || []).filter((x) => x.status === "active").length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [items]);

  // No local sync effect needed; rely on items prop from parent

  // Debounced search effect
  useEffect(() => {
    if (query) {
      setSearchLoading(true);
      const timer = setTimeout(() => {
        setSearchLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((o) => {
      const matchesQ =
        !q ||
        o.title?.toLowerCase().includes(q) ||
        (o.description &&
          o.description[0]?.children?.[0]?.text?.toLowerCase().includes(q));
      const matchesStatus = status === "all" || o.status === status;
      return matchesQ && matchesStatus;
    });
  }, [items, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  async function toggleStatus(id, current, meta) {
    if (pending.id) return;
    // Block activation if expired on client side too
    if (current !== "active" && meta?.endDate) {
      const end = new Date(meta.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (end < today) {
        toast.error("Offer has expired and cannot be activated");
        return;
      }
    }
    setPending({ id, type: "toggle" });
    setError(null);
    try {
      const res = await fetch("/api/offers/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: current === "active" ? "inactive" : "active",
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update status");
      }
      toast.success(
        current === "active"
          ? "Offer deactivated successfully"
          : "Offer activated successfully",
        { duration: 3000 }
      );
      setRetryCount(0);
      if (onChanged) onChanged();
    } catch (e) {
      const errorMsg = e.message || "Failed to update status";
      toast.error(errorMsg, {
        action: {
          label: "Retry",
          onClick: () => toggleStatus(id, current, meta),
        },
      });
      setError(errorMsg);
      setRetryCount((prev) => prev + 1);
    } finally {
      setPending({ id: null, type: null });
    }
  }

  async function remove(id) {
    if (pending.id) return;

    // Find the offer being deleted for better feedback
    const offerToDelete = (items || []).find((item) => item._id === id);
    const offerTitle = offerToDelete?.title || "offer";

    setPending({ id, type: "delete" });
    setError(null);

    // Show initial progress toast
    toast.loading(`Deleting "${offerTitle}"...`, { id: `delete-${id}` });

    try {
      const res = await fetch("/api/offers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      // If already deleted on server, treat as success (idempotent UX)
      if (res.status === 404) {
        toast.success(`"${offerTitle}" was already deleted`, {
          id: `delete-${id}`,
        });
        setRetryCount(0);
        if (onChanged) onChanged();
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete offer");
      }

      // Success feedback (update the existing loading toast if present)
      toast.success(`"${offerTitle}" deleted successfully`, {
        id: `delete-${id}`,
      });
      setRetryCount(0);
      if (onChanged) onChanged();
    } catch (e) {
      const errorMsg = e.message || "Failed to delete offer";

      // Enhanced error feedback
      toast.error(`Failed to delete "${offerTitle}"`, {
        id: `delete-${id}`,
        description: errorMsg,
        duration: 6000,
        action: {
          label: "Try again",
          onClick: () => remove(id),
        },
      });
      setError(errorMsg);
      setRetryCount((prev) => prev + 1);
    } finally {
      setPending({ id: null, type: null });
    }
  }

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    if (onChanged) onChanged();
  };

  const handleClearFilters = () => {
    setQuery("");
    setStatus("all");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">Total: {stats.total}</Badge>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Active: {stats.active}
          </Badge>
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Inactive: {stats.inactive}
          </Badge>
        </div>
        <AddOfferDialog
          tenantType={tenantType}
          tenantId={tenantId}
          triggerClassName="inline-flex items-center justify-center cursor-pointer h-11 px-4 text-sm sm:h-10 sm:px-3"
          onCreated={(offer) => {
            setPage(1);
            if (onChanged) onChanged();
          }}
        />
      </div>
      <OfferSearchFilters
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        searchLoading={searchLoading}
        error={error}
        retryCount={retryCount}
        onRetry={handleRetry}
      />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <OfferTableView
        pageItems={pageItems}
        isLoading={isLoading}
        pending={pending}
        onToggleStatus={toggleStatus}
        onDelete={remove}
        query={query}
        status={status}
        onClearFilters={handleClearFilters}
      />

      <OfferCardView
        pageItems={pageItems}
        isLoading={isLoading}
        pending={pending}
        onToggleStatus={toggleStatus}
        onDelete={remove}
        query={query}
        status={status}
        onClearFilters={handleClearFilters}
      />

      <OfferPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setPage}
      />
    </div>
  );
}
