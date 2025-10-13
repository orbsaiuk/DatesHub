"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookmarkCheck,
  BookmarkPlus,
  Clock3,
  MapPin,
  Star,
} from "lucide-react";
import ImageOptimized from "@/components/ImageOptimized";
import { useState } from "react";
import { toast } from "sonner";
import { SignedIn } from "@clerk/nextjs";
import CompanyInteractionButton from "@/components/CompanyInteractionButton";
import { getFormattedWorkingHours } from "@/lib/utils/workingHours";
import { getDefaultLogoUrl } from "@/lib/utils/defaultLogo";

function StarRating({ rating = 0 }) {
  const stars = Array.from({ length: 5 });
  return (
    <div className="flex items-center gap-1">
      {stars.map((_, index) => {
        const isFilled = index + 1 <= Math.round(rating);
        return (
          <Star
            key={index}
            className={`size-4 ${isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
          />
        );
      })}
    </div>
  );
}

export default function DirectoryTenantCard({
  tenant,
  basePath = "/companies",
  isBookmarked = false,
  onToggleBookmark,
}) {
  const {
    name,
    rating,
    ratingCount,
    location,
    description,
    openingHours,
    extraServices,
  } = tenant;

  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) return;
    const prev = isBookmarked;
    setPending(true);
    try {
      await onToggleBookmark?.();
      toast.success(prev ? "تم الحذف من المحفوظات" : "تم الحفظ في المحفوظات");
    } catch (e) {
      toast.error("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 sm:p-6 shadow-sm relative min-h-[250px] h-full">
      {/* Bookmark button in top left */}
      <SignedIn>
        <div className="absolute top-2 left-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className={`cursor-pointer transition-transform ${pending ? "scale-95" : "hover:scale-105"}`}
            aria-pressed={isBookmarked}
            onClick={handleToggle}
            title={isBookmarked ? "إزالة المرجعية" : "حفظ مرجعية"}
            aria-label={isBookmarked ? "إزالة المرجعية" : "حفظ مرجعية"}
            disabled={pending}
          >
            {isBookmarked ? (
              <BookmarkCheck className="size-6 sm:size-8 text-primary" />
            ) : (
              <BookmarkPlus className="size-6 sm:size-8 text-muted-foreground hover:text-muted-foreground/80" />
            )}
          </Button>
        </div>
      </SignedIn>

      {/* Two halves layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First half: Logo, name, reviews, description */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <ImageOptimized
                sanityImage={tenant.logo?.asset ? tenant.logo : null}
                src={
                  !tenant.logo?.asset && typeof tenant.logo === "string"
                    ? tenant.logo
                    : !tenant.logo?.asset
                      ? getDefaultLogoUrl(tenant.name)
                      : undefined
                }
                alt={`شعار شركة ${tenant.name}`}
                width={120}
                height={120}
                className="rounded-lg w-20 h-20 sm:w-24 sm:h-24 object-cover"
                tenantName={tenant.name}
                context="logo"
                priority
                sizes="(max-width: 640px) 80px, 120px"
              />
            </div>

            {/* Name and reviews */}
            <div className="flex flex-col gap-2 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold">{name}</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <StarRating rating={rating} />
                <span className="text-sm text-muted-foreground">
                  {ratingCount > 0
                    ? `${Number(rating || 0).toFixed(1)} (${ratingCount} ${ratingCount === 1 ? "تقييم" : "تقييم"})`
                    : "لا توجد تقييمات بعد"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-3 leading-relaxed">
            {description}
          </p>

          {/* Extra services */}
          {Array.isArray(extraServices) && extraServices.length > 0 ? (
            <div className=" flex-wrap gap-2 hidden sm:flex">
              {extraServices.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] text-muted-foreground bg-gray-50"
                >
                  {t}
                </span>
              ))}
              {extraServices.length > 6 ? (
                <span className="text-xs text-muted-foreground">
                  +{extraServices.length - 6} المزيد
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Second half: Location, working hours, button in column */}
        <div className="flex flex-col gap-4">
          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="size-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{location}</span>
          </div>

          {/* Working hours */}
          {Array.isArray(openingHours) && openingHours.length > 0 ? (
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 mt-0.5 flex-shrink-0" />
                <span className="font-medium">ساعات العمل:</span>
              </div>
              <div className="flex flex-col gap-1 mr-5">
                {getFormattedWorkingHours(openingHours, 2).map((group, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-sm font-medium min-w-[80px]">
                      {group.dayRange}:
                    </span>
                    <span className="text-sm">{group.formattedHours}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Buttons */}
          <div className="flex items-start gap-2">
            <CompanyInteractionButton
              companyTenantId={tenant.tenantId}
              companyName={tenant.name}
              className="w-fit"
            />
            <Link href={`${basePath}/${tenant.id}`}>
              <Button
                variant="default"
                size="sm"
                className="w-full cursor-pointer bg-button-1 hover:bg-button-1-hover text-white"
              >
                عرض الملف الشخصي
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
