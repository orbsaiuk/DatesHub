"use client";
import { Card, CardContent } from "@/components/ui/card";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-24 sm:w-32" />
                  <div className="h-3 bg-muted rounded w-12 sm:w-16" />
                </div>
                <div className="h-3 bg-muted rounded w-3/4 sm:w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2 sm:w-1/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
