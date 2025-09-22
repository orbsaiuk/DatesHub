"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function OfferPagination({
  totalPages,
  currentPage,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center">
      <Pagination>
        <PaginationContent className="gap-1 md:gap-2">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-10 md:h-9 px-3 md:px-4 text-sm md:text-sm"
            />
          </PaginationItem>
          
          {/* Mobile: Show only current page and total */}
          <div className="flex md:hidden items-center px-3">
            <span className="text-sm text-muted-foreground">
              {currentPage} of {totalPages}
            </span>
          </div>
          
          {/* Desktop: Show all page numbers */}
          <div className="hidden md:flex">
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={i + 1 === currentPage}
                  onClick={() => onPageChange(i + 1)}
                  className="h-9 w-9"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </div>
          
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-10 md:h-9 px-3 md:px-4 text-sm md:text-sm"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
