"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EmptyState() {
  const router = useRouter();
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center animate-in fade-in zoom-in">
          <Search className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-2">
          No results found
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-4">
          Try a different search, or clear filters to see all articles.
        </p>
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/blogs")}
            className="inline-flex items-center px-6 py-3 sm:px-4 sm:py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer min-h-[44px] touch-manipulation"
          >
            Clear filters
          </Button>
        </div>
      </div>
    </section>
  );
}
