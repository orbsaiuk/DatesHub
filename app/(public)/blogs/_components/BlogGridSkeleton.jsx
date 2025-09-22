export default function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Image skeleton */}
          <div className="aspect-[16/10] bg-gray-200 animate-pulse" />

          {/* Content skeleton */}
          <div className="p-4 sm:p-6">
            {/* Title skeleton */}
            <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3" />
            <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse mb-3 sm:mb-4 w-3/4" />

            {/* Excerpt skeleton */}
            <div className="space-y-2 mb-3 sm:mb-4">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>

            {/* Meta skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16 sm:w-20" />
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-12 sm:w-16" />
            </div>

            {/* Read more skeleton */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
              <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-16 sm:w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
