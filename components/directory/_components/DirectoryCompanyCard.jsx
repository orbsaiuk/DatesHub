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
import { CompanyLogo } from "@/components/ImageOptimized";
import { useState } from "react";
import { toast } from "sonner";
import { SignedIn } from "@clerk/nextjs";
import CompanyInteractionButton from "@/components/CompanyInteractionButton";

function StarRating({ rating = 0 }) {
  const stars = Array.from({ length: 5 });
  return (
    <div className="flex items-center gap-1">
      {stars.map((_, index) => {
        const isFilled = index + 1 <= Math.round(rating);
        return (
          <Star
            key={index}
            className={`size-4 ${
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function DirectoryCompanyCard({
  company,
  basePath = "/companies",
  isBookmarked = false,
  onToggleBookmark,
}) {
  const {
    logo,
    name,
    rating,
    ratingCount,
    location,
    description,
    openingHours,
    extraServices,
  } = company;

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
    <div className="rounded-xl border bg-white p-4 sm:p-6 shadow-sm relative">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <CompanyLogo
          company={company}
          size="lg"
          className="rounded-md w-[160px] h-[160px] object-cover"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"></div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-semibold truncate">
                  {name}
                </h3>
              </div>
              <div className="mt-1 flex flex-col items-start gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <StarRating rating={rating} />
                  <span>
                    {ratingCount > 0
                      ? `${Number(rating || 0).toFixed(1)} (${ratingCount} ${ratingCount === 1 ? "تقييم" : "تقييم"})`
                      : "لا توجد تقييمات بعد"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{location}</span>
                </div>
                {Array.isArray(openingHours) && openingHours.length > 0 ? (
                  <div className="flex items-start gap-2">
                    <Clock3 className="size-4 mt-0.5" />
                    <div className="flex flex-col">
                      {openingHours.slice(0, 2).map((line, idx) => (
                        <span key={idx}>{line}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-[44%]">
          <div className="hidden sm:flex md:gap-2 mb-4 w-full">
            <div className="flex gap-2">
              <CompanyInteractionButton
                companyTenantId={company.tenantId}
                companyName={company.name}
              />
              <Link href={`${basePath}/${company.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full cursor-pointer"
                >
                  عرض الملف الشخصي
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-4 sm:line-clamp-none">
            {description}
          </p>
          {Array.isArray(extraServices) && extraServices.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
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
      </div>

      <div className="mt-4 flex gap-2 md:hidden">
        <CompanyInteractionButton
          companyTenantId={company.tenantId}
          companyName={company.name}
          className="flex-1"
        />
        <Link href={`${basePath}/${company.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full cursor-pointer">
            عرض الملف الشخصي
          </Button>
        </Link>
      </div>
      <SignedIn>
        <div className="shrink-0 absolute top-1 right-1 sm:top-0 sm:right-2">
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
              <BookmarkCheck className="size-6 text-primary" />
            ) : (
              <BookmarkPlus className="size-6 text-muted-foreground hover:text-muted-foreground/80" />
            )}
          </Button>
        </div>
      </SignedIn>
    </div>
  );
}
