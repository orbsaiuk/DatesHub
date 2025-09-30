"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaultCategories = [{ title: "جميع المقالات", slug: "all" }];

export default function BlogFilters({
  categories = [],
  total = 0,
  isLoading = false,
  currentPage = 1,
  pageSize = 9,
  totalPages = 1,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const activeSearch = searchParams.get("search") || "";

  // no local search UI here; BlogHero controls the search param

  const pushParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "" || v === "all") {
          // remove param for defaults
          params.delete(k);
        } else {
          params.set(k, v);
        }
      });
      const qs = params.toString();
      router.push(qs ? `/blogs?${qs}` : `/blogs`);
    },
    [router, searchParams]
  );

  const handleCategoryChange = (newSlug) => {
    pushParams({ category: newSlug });
  };

  // no search debounce here; BlogHero updates the URL directly

  const clearFilters = () => {
    router.push("/blogs");
  };

  const displayCategories = useMemo(() => {
    if (categories.length > 0) {
      // ensure first item is All
      const rest = categories.filter((c) => c.slug !== "all");
      return [{ title: "جميع المقالات", slug: "all" }, ...rest];
    }
    return defaultCategories;
  }, [categories]);

  const activeCategoryTitle =
    displayCategories.find((c) => c.slug === activeCategory)?.title ||
    "جميع المقالات";

  // Visual cue shadow on scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className={cn(
        "bg-white border-b border-gray-200 sticky top-0 z-30 transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 sm:py-4 flex flex-col gap-3 sm:gap-4">
          {/* Mobile dropdown for categories */}
          <div className="md:hidden">
            <Select
              value={activeCategory}
              onValueChange={handleCategoryChange}
              disabled={isLoading}
              dir="rtl"
            >
              <SelectTrigger className="w-full sm:w-[280px] min-h-[40px] touch-manipulation">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {displayCategories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop category chips */}
          <div
            className="hidden md:flex flex-wrap gap-2 pt-1"
            aria-label="Categories quick select"
          >
            {displayCategories.map((c) => {
              const isActive = c.slug === activeCategory;
              return (
                <Button
                  key={c.slug}
                  onClick={() => handleCategoryChange(c.slug)}
                  disabled={isLoading}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer min-h-[32px] touch-manipulation",
                    isActive
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    isLoading && "opacity-60 pointer-events-none"
                  )}
                >
                  {c.title}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
