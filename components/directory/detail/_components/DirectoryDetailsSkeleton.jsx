"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DirectoryDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 my-6 sm:my-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <Card className="p-4 sm:p-6 relative">
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            <Skeleton className="h-[150px] w-[250px] rounded-md" />
            <div className="flex-1 min-w-0 space-y-3">
              <Skeleton className="h-6 w-56" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-52" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </Card>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="aspect-[4/3] w-full rounded-xl bg-gray-100" />
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <div className="border-b p-4 sm:p-6">
            <Skeleton className="h-6 w-56" />
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
            <Skeleton className="h-3 w-3/6" />
          </div>
        </Card>
      </div>
    </div>
  );
}
