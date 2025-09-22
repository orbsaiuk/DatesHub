"use client";

export function SkeletonRow() {
  return (
    <tr className="border-t animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-10 w-10 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function OfferSkeletonLoader({ type = "table", count = 3 }) {
  if (type === "card") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}
