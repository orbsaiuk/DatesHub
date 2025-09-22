import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-slot="skeleton"
      className={cn(
        "bg-accent/60 dark:bg-accent/40 animate-pulse rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
