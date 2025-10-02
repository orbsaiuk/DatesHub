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

      {/* Supplier Offers Section Skeleton */}
      <section className="py-12 container mx-auto px-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted rounded-lg p-6 space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="py-12 container mx-auto px-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div
              key={i}
              className="bg-muted rounded-lg p-6 flex flex-col items-center gap-3"
            >
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
