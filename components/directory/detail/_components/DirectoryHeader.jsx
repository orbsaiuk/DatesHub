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
import { urlFor } from "@/sanity/lib/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SignedIn } from "@clerk/nextjs";
import CompanyInteractionButton from "@/components/CompanyInteractionButton";

export default function DirectoryHeader({ company }) {
  const logoUrl =
    typeof company.logo === "string"
      ? company.logo
      : company.logo
        ? urlFor(company.logo).url()
        : null;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    if (!company?.id) return;
    const storageKey = `viewed_company_${company.id}`;
    try {
      if (typeof window !== "undefined") {
        if (sessionStorage.getItem(storageKey)) return;
        sessionStorage.setItem(storageKey, "1");
      }
    } catch {}

    if (hasIncrementedRef.current) return;
    hasIncrementedRef.current = true;

    fetch("/api/company/increment-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ id: company.id }),
    }).catch(() => {});
  }, [company?.id]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/bookmarks", { cache: "no-store" });
        if (!mounted) return;
        if (res.status !== 200) return;
        const data = await res.json();
        const ids = Array.isArray(data?.bookmarks) ? data.bookmarks : [];
        setIsBookmarked(ids.includes(company.id));
      } catch (_) {}
    }
    load();
    return () => {
      mounted = false;
    };
  }, [company?.id]);

  async function toggleBookmark() {
    if (loading) return;
    const prev = isBookmarked;
    try {
      setLoading(true);
      const res = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: company.id }),
      });
      if (res.status === 401) {
        const redirect = encodeURIComponent(`/companies/${company.id}`);
        window.location.href = `/sign-in?redirect_url=${redirect}`;
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
          company={company}
          size="xl"
          className="rounded-md w-[250px] h-[150px] object-cover"
          priority
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold truncate">
              {company.name}
            </h1>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <StarRating rating={company.rating} />
            <span>
              {company?.ratingCount > 0
                ? `${Number(company.rating || 0).toFixed(1)} (${company.ratingCount} ${company.ratingCount === 1 ? "تقييم" : "تقييم"})`
                : "لا توجد تقييمات بعد"}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm">
            <MapPin className="mt-0.5 size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {company.location}
              {Array.isArray(company.locationList) &&
              company.locationList.length > 1 ? (
                <>
                  {" "}
                  <span
                    title={company.locationList.slice(1).join("\n")}
                    className="text-muted-foreground/80 cursor-help"
                  >
                    (+{company.locationList.length - 1} المزيد)
                  </span>
                </>
              ) : null}
            </span>
          </div>
          {Array.isArray(company.extraServices) &&
          company.extraServices.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {company.extraServices.slice(0, 8).map((t) => (
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
              companyTenantId={company.tenantId}
              companyName={company.name}
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
