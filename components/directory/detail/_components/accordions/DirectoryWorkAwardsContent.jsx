"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import ImageOptimized from "@/components/ImageOptimized";
import { urlFor } from "@/sanity/lib/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function DirectoryWorkAwardsContent({
  works = [],
  awards = [],
}) {
  const [workApi, setWorkApi] = React.useState(null);
  const [awardApi, setAwardApi] = React.useState(null);
  const [workIndex, setWorkIndex] = React.useState(0);
  const [awardIndex, setAwardIndex] = React.useState(0);
  const [workCount, setWorkCount] = React.useState(0);
  const [awardCount, setAwardCount] = React.useState(0);

  const [loadedImages, setLoadedImages] = React.useState({});
  const markLoaded = (key) => setLoadedImages((s) => ({ ...s, [key]: true }));

  React.useEffect(() => {
    if (!workApi) return;
    setWorkCount(workApi.slideNodes().length);
    const onSelect = () => setWorkIndex(workApi.selectedScrollSnap());
    onSelect();
    workApi.on("select", onSelect);
    workApi.on("reInit", onSelect);
    return () => {
      workApi.off("select", onSelect);
      workApi.off("reInit", onSelect);
    };
  }, [workApi]);

  React.useEffect(() => {
    if (!awardApi) return;
    setAwardCount(awardApi.slideNodes().length);
    const onSelect = () => setAwardIndex(awardApi.selectedScrollSnap());
    onSelect();
    awardApi.on("select", onSelect);
    awardApi.on("reInit", onSelect);
    return () => {
      awardApi.off("select", onSelect);
      awardApi.off("reInit", onSelect);
    };
  }, [awardApi]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs text-muted-foreground mb-2">أعمالنا</p>

        {works.length === 0 ? (
          <Alert className="px-3 py-2">
            <AlertTitle>لا توجد مشاريع للعرض</AlertTitle>
            <AlertDescription>
              عندما تشارك هذه الشركة دراسات الحالة، ستظهر هنا.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="relative">
            <Carousel
              className="w-full touch-pan-y px-3 mb-4"
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
                containScroll: "trimSnaps",
              }}
              setApi={setWorkApi}
            >
              <CarouselContent>
                {works.map((p, i) => {
                  const firstImage =
                    (Array.isArray(p.images) &&
                      p.images.length > 0 &&
                      p.images[0]) ||
                    p.image ||
                    null;
                  const imgSrc = firstImage
                    ? urlFor(firstImage).width(600).height(400).url()
                    : null;
                  const key = p.id || p._id || p._key || `work-${i}`;
                  const imgLoaded = Boolean(loadedImages[key]);

                  return (
                    <CarouselItem
                      key={key}
                      className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <div className="rounded-lg border bg-white p-2 shadow-sm">
                        <div className="relative">
                          {imgSrc && !imgLoaded && (
                            <Skeleton className="h-32 sm:h-40 w-full rounded-md" />
                          )}

                          {imgSrc ? (
                            <ImageOptimized
                              src={imgSrc}
                              alt={`${p.title || p.name || "Work project"} - Portfolio showcase`}
                              width={600}
                              height={400}
                              className={`h-32 sm:h-40 w-full rounded-md object-cover transition-opacity ${
                                imgLoaded ? "opacity-100" : "opacity-0"
                              }`}
                              onLoad={() => markLoaded(key)}
                            />
                          ) : (
                            <div className="h-32 sm:h-40 w-full rounded-md bg-gray-200" />
                          )}
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                          {p.title || p.name}
                        </div>
                        {p.description && (
                          <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                            {p.description}
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent dark:from-neutral-900" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent dark:from-neutral-900" />
          </div>
        )}

        {workCount > 1 && works.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: workCount }).map((_, i) => (
              <button
                key={`work-dot-${i}`}
                aria-label={`Go to work slide ${i + 1}`}
                onClick={() => workApi && workApi.scrollTo(i)}
                className={`size-2.5 rounded-full transition ${i === workIndex ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="text-xs text-muted-foreground mb-2">الجوائز</p>

        {awards.length === 0 ? (
          <Alert className="px-3 py-2">
            <AlertTitle>لا توجد جوائز مدرجة</AlertTitle>
            <AlertDescription>
              ستظهر الجوائز والتقديرات هنا عند توفرها.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="relative">
            <Carousel
              className="w-full touch-pan-y px-3 mb-4"
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
                containScroll: "trimSnaps",
              }}
              setApi={setAwardApi}
            >
              <CarouselContent>
                {awards.map((a, i) => {
                  const awardImage =
                    a.image || (Array.isArray(a.images) && a.images[0]) || null;
                  const awardImgSrc = awardImage
                    ? urlFor(awardImage).width(600).height(400).url()
                    : null;
                  const key = a.id || a._id || a._key || `award-${i}`;
                  const imgLoaded = Boolean(loadedImages[key]);

                  return (
                    <CarouselItem
                      key={key}
                      className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <div className="rounded-lg border bg-white p-2 shadow-sm">
                        <div className="relative">
                          {awardImgSrc && !imgLoaded && (
                            <Skeleton className="h-28 sm:h-36 w-full rounded-md" />
                          )}

                          {awardImgSrc ? (
                            <ImageOptimized
                              src={awardImgSrc}
                              alt={`${a.title || a.name || "Award"} - Company recognition and achievement`}
                              width={600}
                              height={400}
                              className={`h-28 sm:h-36 w-full rounded-md object-contain bg-white transition-opacity ${
                                imgLoaded ? "opacity-100" : "opacity-0"
                              }`}
                              onLoad={() => markLoaded(key)}
                            />
                          ) : (
                            <div className="h-28 sm:h-36 w-full rounded-md bg-gray-50 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">
                                {a.issuer || a.name || a.title || "Award"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                          {a.title || a.name || a.description}
                        </div>
                        {a.description && (
                          <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                            {a.description}
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent dark:from-neutral-900" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent dark:from-neutral-900" />
          </div>
        )}

        {awardCount > 1 && awards.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: awardCount }).map((_, i) => (
              <button
                key={`award-dot-${i}`}
                aria-label={`Go to award slide ${i + 1}`}
                onClick={() => awardApi && awardApi.scrollTo(i)}
                className={`size-2.5 rounded-full transition ${i === awardIndex ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
