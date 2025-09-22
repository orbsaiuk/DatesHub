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

const categories = ["زهور", "إلكترونيات", "أثاث"];

const features = [
  { title: "إعداد سريع", description: "ابدأ بسرعة بواجهة حديثة وسهلة." },
  { title: "إتاحة كاملة", description: "دعم لوحة المفاتيح وقارئات الشاشة." },
  { title: "قابل للتخصيص", description: "سِمات مرنة ومتغيرات CSS." },
  { title: "متجاوب", description: "تصميم متوافق مع جميع الشاشات." },
];

export default function FeaturedCompanies() {
  const [selectedCategory, setSelectedCategory] = useState("Flowers");

  // Mobile carousel state
  const [embla, setEmbla] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => {
      setSelectedIndex(embla.selectedScrollSnap());
      setSlideCount(embla.scrollSnapList().length);
    };
    onSelect();
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect);
      embla.off("reInit", onSelect);
    };
  }, [embla]);

  return (
    <section id="featured" className="w-full py-10 sm:py-16 bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl sm:text-4xl font-semibold tracking-tight">
            شركات مميزة
          </h2>

          <div className="relative sm:mx-auto mx-0 my-3 sm:my-6">
            <div
              className="flex items-center gap-2 sm:gap-3 overflow-x-auto px-4 sm:px-0 whitespace-nowrap scroll-px-4 snap-x"
              role="tablist"
              aria-label="تصفح الفئات"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cursor-pointer shrink-0 snap-start rounded-full border px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-white text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile carousel */}
          <div className="sm:hidden">
            <Carousel opts={{ align: "start", loop: true }} setApi={setEmbla}>
              <CarouselContent>
                {features.map((item) => (
                  <CarouselItem key={item.title}>
                    <Card className="h-full transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="pt-6">
                        <div className="aspect-[16/9] rounded-lg bg-muted/50 border flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            شعار / صورة
                          </span>
                        </div>
                      </CardContent>
                      <CardHeader className="space-y-1">
                        <CardTitle className="text-base sm:text-lg">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button className="w-full cursor-pointer" size="sm">
                          عرض
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Dots */}
            <div
              className="mt-4 flex items-center justify-center gap-2"
              role="tablist"
              aria-label="Slide pagination"
            >
              {Array.from({ length: slideCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={selectedIndex === i ? "true" : "false"}
                  onClick={() => embla && embla.scrollTo(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    selectedIndex === i
                      ? "bg-primary scale-110"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop/tablet grid */}
          <div className="hidden sm:grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {features.map((item) => (
              <Card
                key={item.title}
                className="h-full transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="pt-6">
                  <div className="aspect-[16/9] rounded-lg bg-muted/50 border flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      شعار / صورة
                    </span>
                  </div>
                </CardContent>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base sm:text-lg">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full cursor-pointer" size="sm">
                    عرض
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
