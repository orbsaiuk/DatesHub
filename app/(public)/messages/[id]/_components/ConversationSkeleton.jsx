"use client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConversationSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 sm:gap-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
        >
          <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 sm:h-6 bg-muted rounded w-24 sm:w-32 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Messages Card Skeleton */}
      <Card
        className="flex flex-col"
        style={{
          height: "calc(100vh - 200px)",
          minHeight: "400px",
          maxHeight: "600px",
        }}
      >
        <CardContent className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4">
          {/* Message skeletons */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-md animate-pulse">
              <div className="px-3 py-2 bg-muted/60 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="h-4 bg-muted rounded w-12 sm:w-16" />
                  <div className="h-3 bg-muted rounded w-16 sm:w-24 hidden sm:block" />
                </div>
                <div className="h-3 bg-muted rounded w-10 sm:w-12 flex-shrink-0" />
              </div>
              <div className="px-3 sm:px-4 py-3 space-y-2">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Composer Skeleton */}
        <div className="border-t p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 h-[80px] bg-muted rounded animate-pulse" />
            <div className="w-11 h-11 sm:w-9 sm:h-9 bg-muted rounded animate-pulse self-end" />
          </div>
        </div>
      </Card>
    </div>
  );
}
