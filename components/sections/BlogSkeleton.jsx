import { Skeleton } from "@/components/ui/skeleton";

export default function BlogSkeleton({ count = 3 }) {
  const items = Array.from({ length: count });

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title skeleton - responsive */}
        <Skeleton className="h-6 sm:h-8 lg:h-10 w-48 sm:w-64 lg:w-80 rounded mb-6 sm:mb-8" />

        {/* Mobile: Enhanced stacked cards */}
        <div className="block sm:hidden space-y-6">
          {items.map((_, idx) => (
            <div key={idx} className="border rounded-lg shadow-sm">
              <div className="p-3">
                <Skeleton className="w-full aspect-[16/10] rounded-lg mb-3" />
              </div>
              <div className="px-3 pb-3 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Tablet and up: Enhanced Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {items.map((_, idx) => (
            <div key={idx} className="border rounded-lg shadow-sm">
              <div className="p-4 lg:p-6">
                <Skeleton className="w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] rounded-lg mb-4" />
              </div>
              <div className="px-4 lg:px-6 pb-4 lg:pb-6 space-y-3 lg:space-y-4">
                <Skeleton className="h-5 sm:h-6 lg:h-7 w-4/5" />
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-3/4" />
                <Skeleton className="h-12 lg:h-14 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
