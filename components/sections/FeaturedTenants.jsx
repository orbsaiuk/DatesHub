"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ImageOptimized from "../ImageOptimized";
import { getDefaultLogoUrl } from "@/lib/utils/defaultLogo";

export default function FeaturedTenants({
  type = "companies",
  items = [],
  totalItems = null,
}) {
  // Mobile carousel state
  const [api, setApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  // Mobile carousel effects
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

  // Render tenant card
  const renderTenantCard = (item) => (
    <Card className="h-full transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md group">
      <CardContent className="pt-6">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-lg border">
          <ImageOptimized
            sanityImage={item.logo?.asset ? item.logo : null}
            src={
              !item.logo?.asset && typeof item.logo === "string"
                ? item.logo
                : !item.logo?.asset
                  ? getDefaultLogoUrl(item.name)
                  : undefined
            }
            alt={`${item.name} logo`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
            tenantName={item.name}
            context="logo"
            priority
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
      </CardContent>
      <CardHeader className="space-y-2">
        <CardTitle className="text-base sm:text-lg line-clamp-2 flex items-center gap-2 justify-between">
          <span className="flex-1">{item.name}</span>
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const rating = item.rating || 0;
              const starIndex = index + 1;

              // Determine star fill based on decimal rating
              let starClass = "text-gray-300"; // Default empty star

              if (starIndex <= Math.floor(rating)) {
                // Fully filled star
                starClass = "fill-yellow-400 text-yellow-400";
              } else if (starIndex === Math.ceil(rating) && rating % 1 !== 0) {
                // Partially filled star (for decimals)
                starClass = "fill-yellow-400/50 text-yellow-400";
              }

              return <Star key={index} className={`w-4 h-4 ${starClass}`} />;
            })}
            <span className="text-sm font-medium ml-1">{item.rating || 0}</span>
            <span className="text-xs text-muted-foreground">
              ({item.ratingCount || 0} تقييم)
            </span>
          </span>
        </CardTitle>

        {item.description && (
          <CardDescription className="text-sm line-clamp-2">
            {item.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardFooter>
        <Button
          asChild
          className="w-full cursor-pointer bg-button-1 hover:bg-button-1-hover text-white"
          size="sm"
        >
          <Link
            href={`/${type === "companies" ? "companies" : "suppliers"}/${item.id}`}
          >
            عرض التفاصيل
          </Link>
        </Button>

        {/* Bottom border accent */}
        <div className="h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      </CardFooter>
    </Card>
  );

  return (
    <section id="featured" className="w-full py-10 sm:py-16 bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl tracking-tight">
              {type === "companies" ? "شركات مميزة" : "موردين مميزين"}
            </h2>
            {/* Only show View All button if there are more items than displayed */}
            {totalItems && totalItems > items.length && (
              <Link
                href={`/${type === "companies" ? "companies" : "suppliers"}`}
                aria-label={`عرض كل ${type === "companies" ? "الشركات" : "الموردين"}`}
                className="hover:underline flex items-center gap-2 text-sm sm:text-base"
              >
                عرض الكل <ArrowLeft className="sm:w-4 w-2 sm:h-4 h-2" />
              </Link>
            )}
          </div>

          {/* Mobile carousel */}
          <div className="sm:hidden">
            <Carousel
              setApi={setApi}
              opts={{ align: "start", direction: "rtl", loop: true }}
            >
              <CarouselContent>
                {items.map((item, index) => (
                  <CarouselItem key={item.id || `tenant-${index}`}>
                    {renderTenantCard(item)}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Dots */}
            {items.length > 0 && (
              <div
                className="mt-4 flex items-center justify-center gap-2"
                role="tablist"
                aria-label="Slide pagination"
              >
                {scrollSnaps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={selectedIndex === i ? "true" : "false"}
                    onClick={() => api?.scrollTo(i)}
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

          <div className="hidden sm:grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {items.map((item, index) => (
              <div key={item.id || `tenant-${index}`}>
                {renderTenantCard(item)}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                لا توجد {type === "companies" ? "شركات" : "موردين"} مميزة
                حالياً.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
