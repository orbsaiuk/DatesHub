"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReviewDialog from "../ReviewDialog";
import StarRating from "../StarRating";

export default function DirectoryReviewsContent({
  isOpen = false,
  reviews = [],
  companyId,
}) {
  const [api, setApi] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("newest");
  const [filterBy, setFilterBy] = React.useState(0);
  const [localReviews, setLocalReviews] = React.useState(reviews || []);

  React.useEffect(() => {
    if (!api) return;
    setSlideCount(api.slideNodes().length);
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (api && isOpen) {
      api.reInit();
    }
  }, [api, isOpen]);

  React.useEffect(() => {
    function onNewReview(e) {
      const payload = e?.detail;
      if (!payload || !payload?._id) return;
      const optimistic = {
        _id: payload._id,
        authorName: payload.authorName || "You",
        title: payload.title || "",
        content: payload.content,
        rating: payload.rating,
        createdAt: new Date().toISOString(),
      };
      setLocalReviews((prev) => [optimistic, ...prev]);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("review-submitted", onNewReview);
      return () => window.removeEventListener("review-submitted", onNewReview);
    }
  }, []);

  React.useEffect(() => {
    setLocalReviews(reviews || []);
  }, [reviews]);

  const displayed = React.useMemo(() => {
    let list = [...localReviews];
    if (filterBy > 0)
      list = list.filter((r) => Number(r.rating || 0) === filterBy);
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "highest") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "lowest") {
      list.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));
    }
    return list;
  }, [localReviews, sortBy, filterBy]);

  React.useEffect(() => {
    function onOpenDialog() {
      setOpen(true);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("open-review-dialog", onOpenDialog);
      return () =>
        window.removeEventListener("open-review-dialog", onOpenDialog);
    }
  }, []);

  return (
    <div className="space-y-3" id="reviews">
      <section>
        <p className="text-xs text-muted-foreground mb-2">أبرز التقييمات</p>
        <div className="flex flex-wrap items-center gap-2 justify-between mb-2">
          <div className="flex items-center gap-2 text-xs">
            <label className="text-muted-foreground">ترتيب</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] h-8" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="highest">أعلى تقييم</SelectItem>
                <SelectItem value="lowest">أقل تقييم</SelectItem>
              </SelectContent>
            </Select>
            <label className="ml-3 text-muted-foreground">تصفية</label>
            <Select
              value={filterBy.toString()}
              onValueChange={(value) => setFilterBy(Number(value))}
            >
              <SelectTrigger className="w-[140px] h-8" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">جميع التقييمات</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {r} نجوم
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-primary hover:underline cursor-pointer"
          >
            اكتب تقييماً
          </button>
        </div>
        {displayed.length === 0 ? (
          <Alert className="px-3 py-2">
            <AlertTitle>لا توجد تقييمات بعد</AlertTitle>
            <AlertDescription>
              عندما يترك العملاء تقييمات، ستراها هنا.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="relative overflow-hidden max-w-full">
            <Carousel
              className="w-full touch-pan-y px-3 mb-4"
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
                containScroll: "trimSnaps",
              }}
              setApi={setApi}
            >
              <CarouselContent className="max-w-[80vw]">
                {displayed.map((r) => (
                  <CarouselItem
                    key={r._id}
                    className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <div className="rounded-md border bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-block size-1.5 rounded-full bg-green-500" />
                        <span>{r.authorName || "Anonymous"}</span>
                        <span className="ml-auto">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <StarRating rating={r.rating || 0} size={14} readOnly />
                        <span className="text-[11px] text-muted-foreground">
                          {Number(r.rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-2 space-y-2 text-[11px] text-muted-foreground">
                        {r.title ? (
                          <p className="text-xs font-medium text-foreground line-clamp-1">
                            {r.title}
                          </p>
                        ) : null}
                        <p className="line-clamp-4">{r.content}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent dark:from-neutral-900" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent dark:from-neutral-900" />
          </div>
        )}

        {slideCount > 1 && displayed.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api && api.scrollTo(i)}
                className={`size-2.5 rounded-full transition ${
                  i === selectedIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {open && (
        <ReviewDialog
          open={open}
          onClose={() => setOpen(false)}
          companyId={companyId}
          onSubmitted={() => setOpen(false)}
        />
      )}
    </div>
  );
}
