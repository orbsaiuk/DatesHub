import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyHomePageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Company Hero Section Skeleton */}
      <section className="w-full bg-muted py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-10 w-40 mt-4" />
          </div>
          <Skeleton className="w-full h-64 sm:h-80 lg:h-96 rounded-xl" />
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="w-full pb-12 sm:py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 max-w-7xl">
          {/* Header (title + controls) */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 sm:w-64" />
            <div className="hidden sm:flex items-center gap-2 pt-6">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>

          {/* Grid / Carousel placeholder */}
          <div className="flex flex-wrap items-center justify-between mt-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-muted rounded-full p-6 flex flex-col items-center justify-between"
              >
                <Skeleton className="w-16 h-16 sm:w-36 sm:h-36 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
