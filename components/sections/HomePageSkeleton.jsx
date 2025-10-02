/**
 * Loading skeleton for home page content while role is being determined
 */
export default function HomePageSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Hero skeleton */}
      <section className="w-full bg-muted py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <div className="h-12 bg-gray-300 rounded-lg w-3/4" />
            <div className="h-6 bg-gray-300 rounded w-full" />
            <div className="h-6 bg-gray-300 rounded w-5/6" />
            <div className="h-10 bg-gray-300 rounded-lg w-32 mt-4" />
          </div>
          <div className="w-full h-64 sm:h-80 lg:h-96 rounded-xl bg-gray-300" />
        </div>
      </section>

      {/* Offers skeleton */}
      <section className="py-12 container mx-auto px-4">
        <div className="h-8 bg-gray-300 rounded w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-300 rounded-lg" />
          ))}
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="py-12 container mx-auto px-4">
        <div className="h-8 bg-gray-300 rounded w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-gray-300 rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
}
