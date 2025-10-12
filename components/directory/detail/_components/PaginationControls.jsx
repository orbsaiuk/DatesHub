import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const maxVisible = 5;
    const pages = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
        السابق
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum) => (
          <Button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            disabled={loading}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            className="w-10 h-10 p-0 cursor-pointer"
          >
            {pageNum}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 cursor-pointer"
      >
        التالي
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>
  );
}
