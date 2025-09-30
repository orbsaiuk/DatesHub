"use client";

import { useMemo, useState } from "react";
import ReviewItem from "./ReviewItem";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReviewsList({ reviews }) {
  const [sortBy, setSortBy] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    if (!reviews?.length) return [];
    if (ratingFilter === "all") return reviews;
    const rating = Number(ratingFilter);
    return reviews.filter((r) => Number(r.rating) === rating);
  }, [reviews, ratingFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case "highest":
        copy.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      case "lowest":
        copy.sort((a, b) => Number(a.rating) - Number(b.rating));
        break;
      case "oldest":
        copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "newest":
      default:
        copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return copy;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage]);

  const handleChangeSort = (val) => {
    setSortBy(val);
    setPage(1);
  };

  const handleChangeFilter = (val) => {
    setRatingFilter(val);
    setPage(1);
  };

  if (!reviews?.length) {
    return (
      <div className="text-center py-10 sm:py-12 px-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-xl sm:text-2xl">⭐</span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          لا توجد تقييمات بعد
        </h3>
        <p className="text-muted-foreground">
          عندما يترك العملاء تقييمات، ستظهر هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          عرض {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, sorted.length)} من {sorted.length}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select value={ratingFilter} onValueChange={handleChangeFilter} dir="rtl">
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="تصفية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التقييمات</SelectItem>
              <SelectItem value="5">5 نجوم</SelectItem>
              <SelectItem value="4">4 نجوم</SelectItem>
              <SelectItem value="3">3 نجوم</SelectItem>
              <SelectItem value="2">نجمتان</SelectItem>
              <SelectItem value="1">نجمة واحدة</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleChangeSort}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="oldest">الأقدم</SelectItem>
              <SelectItem value="highest">أعلى تقييم</SelectItem>
              <SelectItem value="lowest">أقل تقييم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-10 sm:py-12 px-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-xl sm:text-2xl">🔍</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            لا توجد تقييمات تطابق المرشحات
          </h3>
          <p className="text-muted-foreground">
            جرب تعديل مرشح التقييم أو ترتيب الفرز.
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {paged.map((review) => (
            <ReviewItem key={review._id} review={review} />
          ))}
        </div>
      )}

      {sorted.length > pageSize && (
        <Pagination className="pt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              const isEdge = pageNumber === 1 || pageNumber === totalPages;
              const isNear = Math.abs(pageNumber - currentPage) <= 1;
              if (isEdge || isNear) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === currentPage}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
