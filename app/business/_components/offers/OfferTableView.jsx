"use client";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import OfferActions from "./OfferActions";
import OfferSkeletonLoader from "./OfferSkeletonLoader";
import OfferEmptyState from "./OfferEmptyState";
import Image from "next/image";

export default function OfferTableView({
  pageItems,
  isLoading,
  pending,
  onToggleStatus,
  onDelete,
  query,
  status,
  onClearFilters,
}) {
  return (
    <div className="hidden lg:block rounded-xl border bg-card shadow-sm transition-all duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="px-4 py-3 font-medium">العنوان</th>
              <th className="px-4 py-3 font-medium">الصورة</th>
              <th className="px-4 py-3 font-medium">الوصف</th>
              <th className="px-4 py-3 font-medium">البداية</th>
              <th className="px-4 py-3 font-medium">النهاية</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">المشاهدات</th>
              <th className="px-4 py-3 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <OfferSkeletonLoader type="table" count={3} />
            ) : pageItems.length > 0 ? (
              pageItems.map((offer) => (
                <tr
                  key={offer._id}
                  className={cn(
                    "border-t transition-all duration-300 hover:bg-gray-50/50",
                    pending.id === offer._id &&
                      pending.type === "delete" &&
                      "animate-pulse bg-red-50 opacity-60 scale-95",
                    pending.id === offer._id &&
                      pending.type === "toggle" &&
                      "opacity-75"
                  )}
                >
                  <td className="px-4 py-3 font-medium capitalize">
                    {offer.title}
                  </td>
                  <td className="px-4 py-3">
                    {offer.image?.asset?.url ? (
                      <div className="relative">
                        <Image
                          src={offer.image.asset.url}
                          alt={offer.title}
                          className="h-10 w-10 rounded object-cover ring-1 ring-gray-200 transition-transform duration-200 hover:scale-105"
                          loading="lazy"
                          width={40}
                          height={40}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 max-w-[240px] truncate"
                    title={
                      (offer.description &&
                        offer.description[0]?.children?.[0]?.text) ||
                      "-"
                    }
                  >
                    {(offer.description &&
                      offer.description[0]?.children?.[0]?.text) ||
                      "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {offer.startDate
                      ? new Date(offer.startDate).toLocaleDateString("ar-EG")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {offer.endDate
                      ? new Date(offer.endDate).toLocaleDateString("ar-EG")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {offer.status === "active" ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2.5 py-1 text-xs font-medium ring-1 ring-green-200">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                        نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium ring-1 ring-gray-200">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></div>
                        غير نشط
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">
                    {offer.views ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <OfferActions
                      offer={offer}
                      pending={pending}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDelete}
                      className="h-8 w-8"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <OfferEmptyState
                query={query}
                status={status}
                onClearFilters={onClearFilters}
                variant="table"
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
