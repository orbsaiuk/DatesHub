import { Skeleton } from "@/components/ui/skeleton";

export default function DrectoryProductSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 bg-gray-200 rounded"></Skeleton>
          <Skeleton className="h-8 w-32 bg-gray-200 rounded"></Skeleton>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, index) => (
          <Skeleton
            key={index}
            className="bg-gray-100 rounded-xl h-80 animate-pulse"
          >
            <Skeleton className="h-48 bg-gray-200 rounded-t-xl"></Skeleton>
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 bg-gray-200 rounded"></Skeleton>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20 bg-gray-200 rounded"></Skeleton>
                <Skeleton className="h-5 w-16 bg-gray-200 rounded"></Skeleton>
              </div>
              <Skeleton className="h-4 bg-gray-200 rounded"></Skeleton>
              <Skeleton className="h-4 w-3/4 bg-gray-200 rounded"></Skeleton>
            </div>
          </Skeleton>
        ))}
      </div>
    </div>
  );
}
