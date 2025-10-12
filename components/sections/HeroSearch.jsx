"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleGo = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const params = new URLSearchParams();
    params.set("q", trimmed);
    const qs = params.toString();
    router.push(`/companies${qs ? `?${qs}` : ""}`);
  }, [query, router]);

  return (
    <div className="mt-10 w-full max-w-2xl">
      <div className="flex items-center gap-2 bg-white rounded-full p-2 shadow-sm ring-1 ring-black/5">
        <div className="relative flex-1 w-full">
          <label htmlFor="hero-search" className="sr-only">
            ابحث عن الشركات
          </label>
          <Input
            id="hero-search"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            placeholder="ابحث عن الشركات"
            className="flex-1 w-full h-8 sm:h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:border-transparent pr-3 text-sm sm:text-base"
            aria-label="ابحث عن الشركات"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGo();
            }}
          />
        </div>

        <Button
          size="lg"
          aria-label="بحث"
          className="h-8 sm:h-11 w-fit sm:w-auto rounded-full px-2 sm:px-6 cursor-pointer bg-button-1 hover:bg-button-1-hover text-white"
          onClick={handleGo}
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 ml-0 sm:ml-2" />
          <span className="hidden sm:block">بحث</span>
        </Button>
      </div>
    </div>
  );
}
