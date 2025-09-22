"use client";
import { Package, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import OfferActions from "./OfferActions";
import Image from "next/image";

export default function OfferCard({
  offer,
  pending,
  onToggleStatus,
  onDelete,
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border p-4 md:p-5 transition-all duration-300 hover:shadow-md",
        pending.id === offer._id &&
          pending.type === "delete" &&
          "animate-pulse bg-red-50 border-red-200 opacity-60 scale-95 transform",
        pending.id === offer._id && pending.type === "toggle" && "opacity-75"
      )}
    >
      {/* Mobile: full-width image header */}
      <div className="md:hidden -mx-4 mb-3">
        <div className="relative rounded-t-xl overflow-hidden">
          <div className="relative pt-[56.25%] bg-gray-100">
            {offer.image?.asset?.url ? (
              <Image
                src={offer.image.asset.url}
                alt={offer.title}
                width={100}
                height={100}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          {/* Status and views overlay */}
          <div className="absolute left-3 top-3">
            {offer.status === "active" ? (
              <span className="inline-flex items-center rounded-full bg-green-100/90 text-green-700 px-2.5 py-1 text-xs font-medium ring-1 ring-green-200 backdrop-blur">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100/90 text-gray-700 px-2.5 py-1 text-xs font-medium ring-1 ring-gray-200 backdrop-blur">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5" />
                Inactive
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1 rounded-full bg-gray-100/90 px-2.5 py-1 font-medium ring-1 ring-gray-200 backdrop-blur">
              {offer.views ?? 0} <Eye className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4">
        {/* Desktop/Tablet thumbnail */}
        <div className="hidden md:block flex-shrink-0">
          {offer.image?.asset?.url ? (
            <Image
              src={offer.image.asset.url}
              alt={offer.title}
              width={80}
              height={80}
              className="h-20 w-20 rounded-lg object-cover ring-1 ring-gray-200"
              loading="lazy"
            />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-base md:text-lg text-gray-900 truncate pr-2 capitalize">
              {offer.title}
            </h3>
            <OfferActions
              offer={offer}
              pending={pending}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              className="h-10 w-10 md:h-8 md:w-8 flex-shrink-0"
            />
          </div>

          {/* Description */}
          {offer.description && offer.description[0]?.children?.[0]?.text && (
            <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed line-clamp-3">
              {offer.description[0].children[0].text}
            </p>
          )}

          {/* Mobile info grid */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Date</p>
              <p className="text-sm font-medium">
                {offer.startDate
                  ? new Date(offer.startDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Date</p>
              <p className="text-sm font-medium">
                {offer.endDate
                  ? new Date(offer.endDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
