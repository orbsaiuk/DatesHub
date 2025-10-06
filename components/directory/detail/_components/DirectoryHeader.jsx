"use client";

import {
  MapPin,
  ExternalLink,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StarRating from "./StarRating";
import { CompanyLogo } from "@/components/ImageOptimized";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SignedIn } from "@clerk/nextjs";
import CompanyInteractionButton from "@/components/CompanyInteractionButton";

export default function DirectoryHeader({
  tenant,
  basePath = "/companies",
  initialIsBookmarked = null,
  initialInteractionStatus = null,
}) {
  const [isBookmarked, setIsBookmarked] = useState(
    initialIsBookmarked ?? false
  );
  const [loading, setLoading] = useState(false);
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    if (!tenant?.id) return;
    const storageKey = `viewed_${tenant.type}_${tenant.id}`;
    try {
      if (typeof window !== "undefined") {
        if (sessionStorage.getItem(storageKey)) return;
        sessionStorage.setItem(storageKey, "1");
      }
    } catch {}

    if (hasIncrementedRef.current) return;
    hasIncrementedRef.current = true;

    fetch(`/api/${tenant.type}/increment-views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ id: tenant.id }),
    }).catch(() => {});
  }, [tenant?.id]);

  async function toggleBookmark() {
    if (loading) return;
    const prev = isBookmarked;
    try {
      setLoading(true);
      const res = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tenant.id }),
      });
      if (res.status === 401) {
        const redirect = encodeURIComponent(`${basePath}/${tenant.id}`);
        if (typeof window !== "undefined") {
          window.location.href = `/sign-in?redirect_url=${redirect}`;
        }
        return;
      }
      const data = await res.json();
      const now = Boolean(data?.bookmarked);
      setIsBookmarked(now);
      toast.success(now ? "تم الحفظ في المحفوظات" : "تم الحذف من المحفوظات");
    } catch (_) {
      toast.error("حدث خطأ. يرجى المحاولة مرة أخرى.");
      setIsBookmarked(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 sm:p-6 relative">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <CompanyLogo
          tenant={tenant}
          size="xl"
          className="rounded-md w-[250px] h-[150px] object-cover"
          priority
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold truncate">
              {tenant.name}
            </h1>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <StarRating rating={tenant.rating} />
            <span>
              {tenant.ratingCount > 0
                ? `${Number(tenant.rating || 0).toFixed(1)} (${tenant.ratingCount} ${tenant.ratingCount === 1 ? "تقييم" : "تقييم"})`
                : "لا توجد تقييمات بعد"}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm">
            <MapPin className="mt-0.5 size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {tenant.location}
              {Array.isArray(tenant.locationList) &&
              tenant.locationList.length > 1 ? (
                <>
                  {" "}
                  <span
                    title={tenant.locationList.slice(1).join("\n")}
                    className="text-muted-foreground/80 cursor-help"
                  >
                    (+{tenant.locationList.length - 1} المزيد)
                  </span>
                </>
              ) : null}
            </span>
          </div>
          {Array.isArray(tenant.extraServices) &&
          tenant.extraServices.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {tenant.extraServices.slice(0, 8).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] text-muted-foreground bg-gray-50"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <CompanyInteractionButton
              companyTenantId={tenant.id}
              companyName={tenant.name}
              initialStatus={initialInteractionStatus}
            />
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer col-span-2 sm:col-span-1 w-full sm:w-auto"
            >
              زيارة الموقع <ExternalLink className="size-4" />
            </Button>
          </div>
        </div>
        <SignedIn>
          <div className="shrink-0 absolute top-1 left-1 sm:top-2 sm:left-2">
            <Button
              variant="ghost"
              size="icon"
              className={`cursor-pointer hover:bg-white transition-transform ${loading ? "scale-95" : "hover:scale-105"}`}
              aria-pressed={isBookmarked}
              onClick={toggleBookmark}
              disabled={loading}
              title={isBookmarked ? "إزالة المرجعية" : "حفظ مرجعية"}
              aria-label={isBookmarked ? "إزالة المرجعية" : "حفظ مرجعية"}
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
    </Card>
  );
}
