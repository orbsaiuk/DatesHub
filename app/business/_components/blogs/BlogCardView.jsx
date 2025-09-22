"use client";
import BlogCard from "./BlogCard";
import BlogCardSkeleton from "./BlogCardSkeleton";

export default function BlogCardView({
  pageItems,
  pending,
  onPreview,
  onView,
  onDelete,
  createSkeletonCount = 0,
  onAskDelete,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: createSkeletonCount }).map((_, i) => (
        <BlogCardSkeleton key={`creating-skel-${i}`} />
      ))}
      {pageItems.map((b) => (
        <BlogCard
          key={b._id}
          blog={b}
          onPreview={onPreview}
          onView={onView}
          onDelete={() => onDelete(b)}
          onAskDelete={onAskDelete}
          pending={pending}
          showActions
        />
      ))}
    </div>
  );
}
