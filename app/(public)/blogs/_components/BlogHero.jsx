"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BlogHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  // Debounce search query for instant search (300ms delay)
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  // Sync input with URL on navigation
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Update URL when debounced search changes
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    const trimmedSearch = debouncedSearch.trim();

    // Only update if the value actually changed
    if (trimmedSearch !== currentSearch) {
      const params = new URLSearchParams(searchParams);

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      } else {
        params.delete("search");
      }

      router.push(params.toString() ? `/blogs?${params}` : "/blogs", {
        scroll: false,
      });
    }
  }, [debouncedSearch]);

  const handleSearch = (e) => {
    e.preventDefault(); // Keep form submit for Enter key accessibility
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm sm:text-base px-5 py-4 sm:py-3 pl-12 sm:pl-14 pr-12 rounded-full bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent focus:bg-white leading-none min-h-[40px] sm:min-h-[48px] touch-manipulation shadow-lg border border-white/20 transition-all duration-200"
                autoComplete="off"
                spellCheck="false"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              {/* Clear Button (when there's text) */}
              {searchQuery && (
                <Button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all duration-200 cursor-pointer touch-manipulation"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
