import PaginationControls from "./PaginationControls";

export default function ProductsPagination({
  stats,
  currentPage,
  loading,
  onPageChange,
}) {
  if (stats.totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
      {/* Desktop Pagination */}
      <div className="hidden sm:flex items-center gap-2">
        <PaginationControls
          currentPage={currentPage}
          totalPages={stats.totalPages}
          onPageChange={onPageChange}
          loading={loading}
        />
      </div>

      {/* Mobile Pagination */}
      <div className="sm:hidden w-full">
        <PaginationControls
          currentPage={currentPage}
          totalPages={stats.totalPages}
          onPageChange={onPageChange}
          loading={loading}
        />
      </div>

      {/* Page Info */}
      <div className="text-sm text-gray-600">
        صفحة {currentPage} من {stats.totalPages}
      </div>
    </div>
  );
}
