import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-slot="skeleton"
      className={cn(
        "bg-gray-200 dark:bg-gray-200 animate-pulse rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
