"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import DirectoryFilters from "./DirectoryFilters";

export default function DirectoryHeader({
  title = "جميع العناصر",
  basePath = "/companies",
  categories = [],
  initialFilters,
  count = 0,
  cities = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialFilters?.q || "");

  useEffect(() => {
    const curr = searchParams?.get("q") || "";
    setQ(curr);
  }, [searchParams]);

  const doSearch = () => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    router.push(
      `${basePath}${params.toString() ? `?${params.toString()}` : ""}`
    );
  };
  return (
    <section className="container mx-auto my-8 sm:my-10">
      <div className="px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              ({" "}
              {count === 1
                ? "نتيجة واحدة"
                : count === 2
                  ? "نتيجتان"
                  : `${count} نتائج`}{" "}
              )
            </span>
          </div>
          <div className="w-full sm:w-auto ">
            <div className="relative w-full sm:w-80 md:w-96">
              <Input
                placeholder="بحث"
                className="bg-gray-100"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch();
                }}
              />
              <Button
                variant="outline"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 cursor-pointer bg-gray-200 hover:bg-gray-300"
                aria-label="بحث"
                onClick={doSearch}
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200" />
        <DirectoryFilters
          basePath={basePath}
          categories={categories}
          initialFilters={initialFilters}
          cities={cities}
        />
      </div>
    </section>
  );
}
