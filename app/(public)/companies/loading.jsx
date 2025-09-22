import Hero from "./_components/Hero";
import CompanyListSkeleton from "./_components/CompanyListSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <Hero />
      <section className="container mx-auto my-6 sm:my-10 px-4">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
            <Skeleton className="h-4 w-12 sm:w-16" />
          </div>
          <div className="w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-80 md:w-96" />
          </div>
        </div>
        <hr className="my-6 border-gray-200" />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10 hidden lg:block" />
          <Skeleton className="h-10 hidden lg:block" />
        </div>
      </section>
      <CompanyListSkeleton items={5} />
      <div className="flex justify-center my-8">
        <Spinner label="Loading companies…" />
      </div>
      <span className="sr-only">Loading companies listing…</span>
    </div>
  );
}
