"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

export default function UserProfileModal({
  open,
  onOpenChange,
  userId,
  // rating removed per requirements
}) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [limit] = useState(3);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setProfile(data.user))
      .catch(() => console.error("Failed to load user"))
      .finally(() => setLoading(false));
    // Load past reviews
    fetch(
      `/api/user-reviews?id=${encodeURIComponent(userId)}&limit=${limit}&page=${page}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setReviews(data.items || []);
        setTotalReviews(data.count || 0);
        setPageCount(data.pageCount || 1);
      })
      .catch(() => {})
      .finally(() => {});
  }, [open, userId, page, limit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ملف المستخدم</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 space-y-3">
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-24 w-full bg-muted rounded animate-pulse" />
          </div>
        ) : profile ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {profile.imageUrl ? (
                  <Image
                    src={profile.imageUrl}
                    alt={profile.name || "User"}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">U</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {profile.name || "غير معروف"}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-foreground/80 text-xs">
                  <Star
                    className={`${typeof profile.rating === "number" ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} h-3.5 w-3.5`}
                  />
                  {typeof profile.rating === "number"
                    ? `${profile.rating.toFixed(2)} / 5`
                    : "لا توجد تقييمات"}
                  <span className="text-muted-foreground">
                    · {profile.ratingCount || 0}
                  </span>
                </span>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">التقييمات السابقة</p>
                <p className="text-xs text-muted-foreground">
                  {totalReviews} إجمالي
                </p>
              </div>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد</p>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((r) => (
                    <li key={r._id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {r.title || "تقييم"}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Star className="fill-yellow-400 text-yellow-400 h-3.5 w-3.5" />
                          {r.rating}/5
                        </span>
                      </div>
                      {r.content && (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {r.content}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{r.authorName}</span>
                        <span>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {pageCount > 1 && (
                <Pagination className="pt-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage((p) => Math.max(1, p - 1));
                        }}
                        className={
                          page <= 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>
                        <span className="px-2">
                          {page} / {pageCount}
                        </span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < pageCount)
                            setPage((p) => Math.min(pageCount, p + 1));
                        }}
                        className={
                          page >= pageCount
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
لم يتم العثور على المستخدم
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
