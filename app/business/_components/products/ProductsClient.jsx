"use client";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import ProductSearchFilters from "./ProductSearchFilters";
import ProductTableView from "./ProductTableView";
import ProductCardView from "./ProductCardView";
import ProductPagination from "./ProductPagination";
import AddProductDialog from "@/app/business/_components/products/AddProductDialog";
import { Badge } from "@/components/ui/badge";

export default function ProductsClient({
  tenantType,
  tenantId,
  items,
  onChanged,
}) {
  // Simple state; avoid optimistic local updates
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(10);
  const pageSize = 10;
  const [sortOrder, setSortOrder] = useState("newest");
  const [pending, setPending] = useState({ id: null, type: null });
  const [isLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Computed stats from current items
  const stats = useMemo(() => {
    const total = (items || []).length;
    return { total };
  }, [items]);

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
    // Filter by search query
    const q = query.trim().toLowerCase();
    const filteredItems = (items || []).filter((p) => {
      const matchesQ =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        (p.description &&
          p.description[0]?.children?.[0]?.text?.toLowerCase().includes(q));
      return matchesQ;
    });

    // Sort items based on sortOrder
    return [...filteredItems].sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b._createdAt || 0) - new Date(a._createdAt || 0);
        case "oldest":
          return new Date(a._createdAt || 0) - new Date(b._createdAt || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        default:
          return new Date(b._createdAt || 0) - new Date(a._createdAt || 0);
      }
    });
  }, [items, query, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  async function remove(id) {
    if (pending.id) return;

    // Find the product being deleted for better feedback
    const productToDelete = (items || []).find((item) => item._id === id);
    const productTitle = productToDelete?.title || "منتج";

    setPending({ id, type: "delete" });
    setError(null);

    // Show initial progress toast
    toast.loading(`جاري حذف "${productTitle}"...`, { id: `delete-${id}` });

    try {
      const res = await fetch("/api/products/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      // If already deleted on server, treat as success (idempotent UX)
      if (res.status === 404) {
        toast.success(`"${productTitle}" تم حذفه مسبقاً`, {
          id: `delete-${id}`,
        });
        setRetryCount(0);
        if (onChanged) onChanged();
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل في حذف المنتج");
      }

      // Success feedback (update the existing loading toast if present)
      toast.success(`"${productTitle}" تم حذفه بنجاح`, {
        id: `delete-${id}`,
      });
      setRetryCount(0);
      if (onChanged) onChanged();
    } catch (e) {
      const errorMsg = e.message || "فشل في حذف المنتج";

      // Enhanced error feedback
      toast.error(`فشل في حذف "${productTitle}"`, {
        id: `delete-${id}`,
        description: errorMsg,
        duration: 6000,
        action: {
          label: "حاول مرة أخرى",
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
  };

  const handleUpdated = () => {
    // Refresh data after product update
    if (onChanged) onChanged();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">المجموع: {stats.total}</Badge>
        </div>
        <AddProductDialog
          tenantType={tenantType}
          tenantId={tenantId}
          triggerClassName="inline-flex items-center justify-center cursor-pointer h-11 px-4 text-sm sm:h-10 sm:px-3"
          onCreated={() => {
            setPage(1);
            if (onChanged) onChanged();
          }}
        />
      </div>
      <ProductSearchFilters
        query={query}
        setQuery={setQuery}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
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

      <ProductTableView
        pageItems={pageItems}
        isLoading={isLoading}
        pending={pending}
        onDelete={remove}
        onUpdated={handleUpdated}
        query={query}
        onClearFilters={handleClearFilters}
      />

      <ProductCardView
        pageItems={pageItems}
        isLoading={isLoading}
        pending={pending}
        onDelete={remove}
        onUpdated={handleUpdated}
        query={query}
        onClearFilters={handleClearFilters}
      />

      <ProductPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setPage}
      />
    </div>
  );
}
