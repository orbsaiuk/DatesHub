"use client";

import ImageOptimized from "@/components/ImageOptimized";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { client } from "@/sanity/lib/client";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries/categories";
import { useState, useEffect, useCallback } from "react";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [api, setApi] = useState();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await client.fetch(ALL_CATEGORIES_QUERY);
        const categoriesData = Array.isArray(result)
          ? result
          : (result?.data ?? []);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // Set initial state

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = useCallback(
    (index) => {
      if (api) {
        api.scrollTo(index);
      }
    },
    [api]
  );

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 max-w-7xl">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            slidesToScroll: 1,
            loop: false,
            direction: "rtl",
          }}
          aria-label="الفئات"
          setApi={setApi}
        >
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl tracking-tight leading-tight text-section-title">
              تصفح حسب الفئة
            </h2>
            <div className="hidden sm:flex items-center gap-2 pt-8">
              <CarouselPrevious
                variant="outline"
                size="icon"
                className="!static cursor-pointer"
              />
              <CarouselNext
                variant="outline"
                size="icon"
                className="!static cursor-pointer"
              />
            </div>
          </div>

          <CarouselContent className="mt-4">
            {categories?.map((category) => {
              const title = category?.title || "Untitled";
              const slug = category?.slug || "";
              const src =
                category?.iconUrl && typeof category.iconUrl === "string"
                  ? category.iconUrl
                  : "/window.svg";
              const key = category?._id || category?.slug || title;
              const href = slug
                ? `/companies?spec=${encodeURIComponent(slug)}`
                : "/companies";
              return (
                <CarouselItem key={key} className="basis-[40%] sm:basis-1/4">
                  <Link
                    href={href}
                    aria-label={`تصفح الشركات ضمن ${title}`}
                    className="group flex flex-col gap-2 items-center touch-manipulation cursor-pointer w-fit"
                  >
                    <ImageOptimized
                      src={src}
                      sanityImage={category?.icon}
                      alt={`أيقونة فئة ${title} - تصفح شركات ${title.toLowerCase()} على DatesHub`}
                      width={200}
                      height={200}
                      className="rounded-sm aspect-square object-contain bg-white ring-1 ring-border/50 shadow-sm transition-transform duration-300 group-hover:scale-105 group-active:scale-95 p-1"
                      loading="lazy"
                      context="category icon"
                    />
                    <h3 className="text-sm sm:text-base tracking-tight text-center">
                      {title}
                    </h3>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {api && api.scrollSnapList().length > 1 && (
          <div
            className="mt-2 flex items-center justify-center gap-2 sm:hidden"
            role="tablist"
            aria-label="Slide pagination"
          >
            {api.scrollSnapList().map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={selectedIndex === i ? "true" : "false"}
                onClick={() => scrollTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  selectedIndex === i
                    ? "bg-primary scale-110"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
