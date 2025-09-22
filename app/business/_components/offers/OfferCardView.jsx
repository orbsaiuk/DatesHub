"use client";
import OfferCard from "./OfferCard";
import OfferSkeletonLoader from "./OfferSkeletonLoader";
import OfferEmptyState from "./OfferEmptyState";

export default function OfferCardView({
  pageItems,
  isLoading,
  pending,
  onToggleStatus,
  onDelete,
  query,
  status,
  onClearFilters,
}) {
  return (
    <div className="lg:hidden space-y-4">
      {isLoading ? (
        <OfferSkeletonLoader type="card" count={3} />
      ) : pageItems.length > 0 ? (
        pageItems.map((offer) => (
          <OfferCard
            key={offer._id}
            offer={offer}
            pending={pending}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ))
      ) : (
        <OfferEmptyState
          query={query}
          status={status}
          onClearFilters={onClearFilters}
          variant="card"
        />
      )}
    </div>
  );
}
