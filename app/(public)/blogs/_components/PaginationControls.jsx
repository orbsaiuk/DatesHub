"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationControls({
  currentPage,
  pageCount,
  getPageNumbers,
  goToPage,
}) {
  if (!pageCount || pageCount <= 1) return null;

  return (
    <div className="py-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage - 1);
              }}
            />
          </PaginationItem>
          {getPageNumbers().map((p) => (
            <PaginationItem key={p}>
              {typeof p === "number" ? (
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(p);
                  }}
                >
                  {p}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
