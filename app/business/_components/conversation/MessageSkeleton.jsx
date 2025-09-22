"use client";

export default function MessageSkeleton() {
  return (
    <div className="border rounded-lg bg-card animate-pulse">
      <div className="px-3 py-2 bg-muted/60 border-b rounded-t-lg flex items-center justify-between">
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
  );
}
