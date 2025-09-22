"use client";
import { Card, CardContent } from "@/components/ui/card";

export default function MessageSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="border rounded-md animate-pulse">
          <div className="px-3 py-2 bg-muted/60 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-24 hidden sm:block" />
            </div>
            <div className="h-3 bg-muted rounded w-12" />
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="space-y-1">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
