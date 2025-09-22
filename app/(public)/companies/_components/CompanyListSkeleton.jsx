"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyListSkeleton({ items = 3 }) {
  return (
    <div
      className="container mx-auto px-4 my-6 sm:my-8 space-y-3 sm:space-y-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-white p-4 sm:p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            <Skeleton className="h-14 w-14 sm:h-20 sm:w-20 rounded-md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 w-full space-y-2">
                  <Skeleton className="h-5 w-2/3 sm:w-48" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-1/3 sm:w-24" />
                    <Skeleton className="h-3 w-1/2 sm:w-28" />
                  </div>
                  <Skeleton className="h-3 w-5/6 sm:w-64" />
                </div>
              </div>
            </div>
            <div className="w-full md:w-[44%] space-y-2">
              <Skeleton className="h-16 sm:h-[72px] w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20 hidden sm:block" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading companies…</span>
    </div>
  );
}
