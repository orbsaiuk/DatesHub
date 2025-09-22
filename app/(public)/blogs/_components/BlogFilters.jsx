"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const defaultCategories = [{ title: "All Articles", slug: "all" }];

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
      return [{ title: "All Articles", slug: "all" }, ...rest];
    }
    return defaultCategories;
  }, [categories]);

  const activeCategoryTitle =
    displayCategories.find((c) => c.slug === activeCategory)?.title ||
    "All Articles";

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
            <label htmlFor="category-mobile" className="sr-only">
              Select category
            </label>
            <select
              id="category-mobile"
              value={activeCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] touch-manipulation"
            >
              {displayCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
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

          {/* Meta info line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-20 sm:w-24 bg-gray-200 rounded animate-pulse" />
              </span>
            ) : (
              <span className="text-xs sm:text-sm">
                Showing <strong className="text-gray-700">{total}</strong>{" "}
                article
                {total === 1 ? "" : "s"}
                {totalPages > 1 && (
                  <>
                    {" "}
                    • Page{" "}
                    <strong className="text-gray-700">
                      {currentPage}
                    </strong> of{" "}
                    <strong className="text-gray-700">{totalPages}</strong>
                  </>
                )}
              </span>
            )}
            {(activeCategory !== "all" || activeSearch) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gray-700 text-xs sm:text-sm">
                  Filters:
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeCategory !== "all" && (
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                      {activeCategoryTitle}
                    </span>
                  )}
                  {activeSearch && (
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs max-w-[200px] truncate">
                      Search: "{activeSearch}"
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 h-auto min-h-[28px] touch-manipulation"
                >
                  <X className="w-3 h-3" /> Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
