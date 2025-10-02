"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import BlogGrid from "./BlogGrid";
import PaginationControls from "./PaginationControls";
import EmptyState from "./EmptyState";

function normalize(str = "") {
  return str.toLowerCase();
}

export default function BlogsClient({ blogs = [] }) {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const listTopRef = useRef(null);
  const previousPageRef = useRef(null);

  const search = searchParams.get("search") || "";

  const filtered = useMemo(() => {
    let items = Array.isArray(blogs) ? [...blogs] : [];

    // Text search in title and excerpt
    const q = normalize(search).trim();
    if (q) {
      items = items.filter((b) => {
        const inTitle = normalize(b.title).includes(q);
        const inExcerpt = normalize(b.excerpt || "").includes(q);
        return inTitle || inExcerpt;
      });
    }
    return items;
  }, [blogs, search]);

  const totalItems = filtered.length || 0;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  const currentBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Reset to first page when search changes (instant)
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [pageCount, currentPage]);

  // Smooth scroll to top when page changes
  useEffect(() => {
    if (previousPageRef.current == null) {
      previousPageRef.current = currentPage;
      return;
    }

    if (previousPageRef.current === currentPage) {
      return;
    }

    if (typeof window === "undefined") return;

    const headerEl = document.querySelector("header");
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const extraSpacing = 100;

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

  return (
    <div>
      {filtered.length > 0 ? (
        <>
          <div ref={listTopRef} />
          <BlogGrid blogs={currentBlogs} />
          {pageCount > 1 && (
            <PaginationControls
              currentPage={currentPage}
              pageCount={pageCount}
              getPageNumbers={getPageNumbers}
              goToPage={goToPage}
            />
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
