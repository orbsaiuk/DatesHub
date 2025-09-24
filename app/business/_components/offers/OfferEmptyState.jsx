"use client";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function OfferEmptyState({
  query,
  status,
  onClearFilters,
  variant = "table", // "table" or "card"
}) {
  const hasFilters = query || status !== "all";
  const title = hasFilters ? "لا توجد عروض مطابقة" : "لا توجد عروض بعد";
  const description = hasFilters
    ? "جرب تعديل البحث أو المرشحات"
    : "أنشئ عرضك الأول للبدء";

  if (variant === "card") {
    return (
      <div className="bg-card rounded-xl border p-6 sm:p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-gray-100 p-4">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="text-base text-muted-foreground max-w-sm">
              {description}
            </p>
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="default"
              onClick={onClearFilters}
              className="mt-4 h-12 md:h-10"
            >
              مسح المرشحات
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <tr>
      <td colSpan={8} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-gray-100 p-3">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="mt-2"
            >
              مسح المرشحات
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
