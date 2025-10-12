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
    e.preventDefault();
  };

  return (
    <section className="bg-[url('/Hero-blog.jpg')] bg-cover bg-left text-white h-[50vh] relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative container h-full mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center z-10">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight sm:leading-tight tracking-tight">
          مدونتنا
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-8 sm:mb-10 lg:mb-12 w-full sm:w-[60%] mx-auto leading-relaxed px-2 sm:px-0">
          استلهم الأفكار من النصائح والمقالات والقصص حول عالم التمور الفاخرة.
          سواء كنت صاحب عمل تبحث عن التوسع أو من عشّاق التمور، ستجد لدينا كل ما
          تحتاج معرفته عن الجودة، والمصادر، وآخر اتجاهات صناعة التمور.
        </p>

        <form onSubmit={handleSearch} className="mx-auto px-2 sm:px-0">
          <div className="relative group">
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
        </form>
      </div>
    </section>
  );
}
