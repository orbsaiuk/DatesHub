import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Main Article Skeleton */}
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Title Skeleton - Mobile-first responsive */}
          <div className="mb-4 sm:mb-6">
            <Skeleton className="h-8 sm:h-10 lg:h-12 xl:h-14 w-full max-w-2xl mb-2" />
            <Skeleton className="h-8 sm:h-10 lg:h-12 xl:h-14 w-3/4 max-w-xl" />
          </div>

          {/* Image Skeleton - Responsive aspect ratios */}
          <div className="mb-6 sm:mb-8">
            <Skeleton className="w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] rounded-lg sm:rounded-xl" />
          </div>

          {/* Excerpt Skeleton */}
          <div className="mb-6 sm:mb-8 space-y-2">
            <Skeleton className="h-4 sm:h-5 w-full" />
            <Skeleton className="h-4 sm:h-5 w-5/6" />
            <Skeleton className="h-4 sm:h-5 w-4/5" />
          </div>

          {/* Content Skeleton - Enhanced for mobile reading */}
          <div className="prose prose-neutral max-w-none space-y-3 sm:space-y-4">
            {/* Multiple paragraphs */}
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-3/4" />
              </div>
            ))}
            
            {/* Subheading skeleton */}
            <Skeleton className="h-6 sm:h-7 lg:h-8 w-2/3 mt-6 sm:mt-8" />
            
            {/* More content */}
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx + 8} className="space-y-2">
                <Skeleton className="h-4 sm:h-5 w-full" />
                <Skeleton className="h-4 sm:h-5 w-5/6" />
                <Skeleton className="h-4 sm:h-5 w-4/5" />
              </div>
            ))}
          </div>
        </article>

        {/* What to Read Next Section Skeleton */}
        <div className="border-t bg-muted/30">
          <section className="w-full py-8 sm:py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Section Title Skeleton */}
              <Skeleton className="h-6 sm:h-8 lg:h-10 w-48 sm:w-64 mx-auto mb-6 sm:mb-8" />

              {/* Mobile: Single card skeleton */}
              <div className="block sm:hidden">
                <div className="border rounded-lg shadow-sm">
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

                {/* Dots Skeleton */}
                <div className="mt-6 flex items-center justify-center gap-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-3 w-3 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Tablet and up: Grid Skeleton */}
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {Array.from({ length: 3 }).map((_, idx) => (
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
        </div>
      </main>
    </div>
  );
}
