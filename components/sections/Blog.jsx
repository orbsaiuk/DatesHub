"use client";

import Link from "next/link";
import BlogSkeleton from "@/components/sections/BlogSkeleton";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import BlogCard from "@/components/blog/BlogCard";
import { useState, useEffect } from "react";

export default function Blog({
  items = [],
  loading = false,
  skeletonCount = 3,
  title = "Event planning tips",
}) {
  const [api, setApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (!api) return;

    setScrollSnaps(api.scrollSnapList());
    setSelectedIndex(api.selectedScrollSnap());

    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", () => {
      setScrollSnaps(api.scrollSnapList());
      onSelect();
    });

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Show skeletons if loading requested
  if (loading) return <BlogSkeleton count={skeletonCount} />;

  // Hide section if no blogs available
  if (!items || items.length === 0) return null;

  // Enforce max 3 items rendered
  const visible = items.slice(0, 3);

  return (
    <section className="w-full py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {title}
          </h2>
          <Link href="/blogs" aria-label="عرض كل مقالات المدونة">
            <Button variant="ghost" className="h-9 sm:h-10 cursor-pointer">
              عرض الكل
            </Button>
          </Link>
        </div>

        {/* Mobile: Carousel */}
        <div className="block sm:hidden">
          <Carousel setApi={setApi} opts={{ align: "start" }}>
            <CarouselContent>
              {visible.map((item) => (
                <CarouselItem key={item._id}>
                  <BlogCard blog={item} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dots */}
          <div
            className="mt-4 flex items-center justify-center gap-2"
            aria-label="ترقيم شرائح المعرض"
          >
            {scrollSnaps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => api?.scrollTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={selectedIndex === idx}
                className={`h-2 w-2 rounded-full transition-colors ${
                  selectedIndex === idx
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tablet and up: Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visible.map((item) => (
            <BlogCard key={item._id} blog={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
