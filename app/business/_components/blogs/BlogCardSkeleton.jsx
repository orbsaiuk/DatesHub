"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogCardSkeleton() {
  return (
    <Card className="h-full flex flex-col gap-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Skeleton className="w-full h-32 rounded-md mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
