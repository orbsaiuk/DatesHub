import ImageOptimized from "@/components/ImageOptimized";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { sanityFetch } from "@/sanity/lib/live";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries/categories";

export default async function Categories() {
  const result = await sanityFetch({ query: ALL_CATEGORIES_QUERY });
  const categories = Array.isArray(result) ? result : result?.data ?? [];

  return (
    <section className="w-full pb-12 sm:py-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 max-w-7xl">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            slidesToScroll: 1,
            loop: false,
          }}
          aria-label="الفئات"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-4xl font-semibold tracking-tight leading-tight">
              تصفح حسب الفئات
            </h2>
            <div className="hidden sm:flex items-center gap-2 pt-6">
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
                <CarouselItem
                  key={key}
                  className="basis-[40%] sm:basis-1/3 md:basis-1/4"
                >
                  <Link
                    href={href}
                    aria-label={`تصفح الشركات ضمن ${title}`}
                    className="group p-2 sm:p-4 flex flex-col gap-2 items-center touch-manipulation cursor-pointer"
                  >
                    <ImageOptimized
                      src={src}
                      sanityImage={category?.icon}
                      alt={`أيقونة فئة ${title} - تصفح شركات ${title.toLowerCase()} على OrbsAI`}
                      width={200}
                      height={200}
                      className="rounded-full aspect-square object-contain bg-white ring-1 ring-border/50 shadow-sm transition-transform duration-300 group-hover:scale-105 group-active:scale-95 p-4"
                      loading="lazy"
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 75vw"
                      context="category icon"
                    />
                    <h3 className="text-sm sm:text-base font-semibold tracking-tight text-center">
                      {title}
                    </h3>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
