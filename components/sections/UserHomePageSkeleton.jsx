import { Skeleton } from "@/components/ui/skeleton";

export default function UserHomePageSkeleton() {
  return (
    <div className="space-y-12">
      {/* Hero Section Skeleton */}
      <section className="w-full bg-muted py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl items-center text-center">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
          </div>
        </div>
      </section>

      {/* Discover Section Skeleton */}
      <section className="w-full py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
          {/* Left: company logos grid */}
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] sm:aspect-[2/1] rounded-xl overflow-hidden bg-muted ring-1 ring-border/50 flex items-center justify-center"
                >
                  <Skeleton className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: text + button */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-8 sm:h-10 w-2/3" />
            <Skeleton className="h-4 w-full sm:w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="w-full pb-12 sm:py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 max-w-7xl">
          {/* Header (title + controls) */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 sm:w-64" />
            <div className="hidden sm:flex items-center gap-2 pt-6">
              <Skeleton className="h-10 w-10 rounded-sm" />
              <Skeleton className="h-10 w-10 rounded-sm" />
            </div>
          </div>

          {/* Grid / Carousel placeholder */}
          <div className="flex flex-wrap gap-20 mt-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-muted rounded-sm p-5 flex flex-col items-center justify-between"
              >
                <Skeleton className="w-16 h-16 sm:w-36 sm:h-36 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
