"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import DirectoryCompanyCard from "./DirectoryCompanyCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function DirectoryList({
  items = [],
  emptyTitle = "لا توجد نتائج",
  emptyDescription = "جرب تعديل المرشحات أو البحث.",
  clearHref = "/companies",
  pageSize = 5,
  basePath = "/companies",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef(null);
  const previousPageRef = useRef(undefined);

  const uniqueItems = useMemo(() => {
    const unique = [];
    const seen = new Set();
    for (const it of items) {
      const id = it?.id ?? it?._id ?? undefined;
      if (id && !seen.has(id)) {
        seen.add(id);
        unique.push(it);
      }
    }
    return unique;
  }, [items]);

  const totalItems = uniqueItems.length || 0;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return uniqueItems.slice(startIndex, startIndex + pageSize);
  }, [uniqueItems, currentPage, pageSize]);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [pageCount, currentPage]);

  useEffect(() => {
    if (previousPageRef.current == null) {
      previousPageRef.current = currentPage;
      return;
    }
    if (previousPageRef.current === currentPage) return;
    if (typeof window === "undefined") return;

    const headerEl = document.querySelector("header");
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const extraSpacing = 200;

    if (listTopRef.current) {
      const targetTop =
        listTopRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, targetTop - headerHeight - extraSpacing),
        behavior: "smooth",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    previousPageRef.current = currentPage;
  }, [currentPage]);

  const goToPage = (pageNumber) => {
    const next = Math.min(Math.max(1, pageNumber), pageCount);
    setCurrentPage(next);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (pageCount <= 5) {
      for (let i = 1; i <= pageCount; i += 1) pages.push(i);
      return pages;
    }
    const showLeftEllipsis = currentPage > 3;
    const showRightEllipsis = currentPage < pageCount - 2;
    pages.push(1);
    if (showLeftEllipsis) pages.push("ellipsis-left");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(pageCount - 1, currentPage + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (showRightEllipsis) pages.push("ellipsis-right");
    pages.push(pageCount);
    return pages;
  };

  const hasNoResults = totalItems === 0;

  return (
    <div ref={listTopRef} className="container mx-auto px-4 my-6 sm:my-8">
      {hasNoResults ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{emptyTitle}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyDescription}
            </p>
            <div className="mt-4">
              <a href={clearHref}>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  مسح المرشحات
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-5">
            {currentItems.map((company) => (
              <DirectoryCompanyCard
                key={company.id}
                company={company}
                basePath={basePath}
                isBookmarked={false}
                onToggleBookmark={async () => {}}
              />
            ))}
          </div>

          {pageCount > 1 ? (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((p, idx) => (
                    <PaginationItem key={`${p}-${idx}`}>
                      {typeof p === "number" ? (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            goToPage(p);
                          }}
                          isActive={p === currentPage}
                          aria-current={p === currentPage ? "page" : undefined}
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
                      className={
                        currentPage === pageCount
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
