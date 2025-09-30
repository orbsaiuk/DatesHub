"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BlogHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [submitting, setSubmitting] = useState(false);

  // Keep local input in sync when user navigates
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    // navigation completed -> stop button spinner
    if (submitting) setSubmitting(false);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }

    // If nothing changed, do not keep spinner on
    const next = params.toString();
    const current = new URLSearchParams(searchParams).toString();
    if (next === current) {
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    router.push(next ? `/blogs?${next}` : `/blogs`);
  };

  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Background pattern for visual enhancement */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title with enhanced mobile typography */}
        <h1 className="text-2xl sm:text-4xl  font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight sm:leading-tight tracking-tight">
          مدونتنا
        </h1>

        {/* Description with better mobile readability */}
        <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-8 sm:mb-10 lg:mb-12 max-w-7xl mx-auto leading-relaxed px-2 sm:px-0">
          ابقَ ملهمًا بالنصائح والاتجاهات والأدلة لجعل كل حدث لا يُنسى. سواء كنت
          منظم فعاليات أو شركة أو تخطط لاحتفال لمرة واحدة، نحن نوفر لك كل ما
          تحتاجه.
        </p>

        {/* Enhanced Search Form */}
        <form
          onSubmit={handleSearch}
          className="max-w-md sm:max-w-lg mx-auto px-2 sm:px-0"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative">
              <Input
                type="text"
                placeholder="البحث عن المقالات..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (submitting) setSubmitting(false);
                }}
                className="w-full text-sm sm:text-base px-5 py-4 sm:py-3 pl-12 sm:pl-14 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent focus:bg-white leading-none min-h-[40px] sm:min-h-[48px] touch-manipulation shadow-lg border border-white/20 transition-all duration-200"
                autoComplete="off"
                spellCheck="false"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer min-h-[30px] touch-manipulation shadow-md border border-blue-500/20"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-1 sm:gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline text-xs sm:text-sm">
                      جاري البحث
                    </span>
                  </span>
                ) : (
                  <>
                    <Search className="h-2 w-2 sm:hidden" />
                    <span className="hidden sm:inline text-sm">بحث</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
