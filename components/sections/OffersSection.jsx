"use client";

import { useState, useEffect } from "react";
import { urlFor } from "@/sanity/lib/image";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import ImageOptimized, { CompanyLogo } from "@/components/ImageOptimized";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function OffersSection({ type = "company" }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`/api/offers/public?type=${type}`);
        const data = await response.json();
        setOffers(data.offers || []);
      } catch (error) {
        // Error fetching offers - fail silently in production
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [type]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  if (!offers.length) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header (skeleton) */}
          <div className="mb-8 flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
            <div className="h-6 bg-gray-200 rounded-md w-32" />
          </div>

          {/* Banner shell (skeleton) */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg border min-h-[280px] animate-pulse">
            <div className="absolute inset-0 bg-gray-100" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 sm:mb-10 flex justify-between items-center">
          <h2 className="text-xl sm:text-4xl font-semibold tracking-tight">
            عروض حصرية
          </h2>
          <Link
            href="/business/offers"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-all duration-200 hover:underline"
          >
            عرض كل العروض
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 3000, stopOnMouseEnter: true })]}
          className="w-full"
        >
          <CarouselContent className="-ml-0">
            {offers.map((offer, index) => (
              <CarouselItem key={offer._id || index} className="pl-0">
                <OfferBanner offer={offer} type={type} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {offers.length > 1 && (
            <>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </>
          )}
        </Carousel>

        <div
          className="flex items-center justify-center gap-2 mt-6 min-h-4"
          role="tablist"
          aria-label="ترقيم عروض"
          aria-hidden={offers.length <= 1}
        >
          {offers.length > 1
            ? offers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  aria-label={`اذهب إلى الشريحة ${index + 1}`}
                  aria-selected={index === currentIndex}
                  role="tab"
                  className={`h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-gray-300 hover:bg-gray-400 w-2"
                  }`}
                />
              ))
            : null}
        </div>
      </div>
    </section>
  );
}

function OfferBanner({ offer, type }) {
  const isSupplierOffer = type === "supplier";
  const entity = isSupplierOffer ? offer.supplier : offer.company;
  const imageUrl = offer.image?.asset?.url
    ? urlFor(offer.image).width(800).height(400).url()
    : null;
  const logoUrl = entity?.logo?.asset?.url
    ? urlFor(entity.logo).width(60).height(60).url()
    : null;
  const hasBackgroundImage = Boolean(imageUrl);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("ar-EG", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg border min-h-[280px]">
      {/* Background Image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <ImageOptimized
            src={imageUrl}
            alt={`${offer.title} - عرض خاص من ${
              entity?.name || "شركة"
            } على DatesHub`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-8 lg:p-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div>
            {/* Entity Badge */}
            <div
              className={`inline-flex items-center gap-3 rounded-full px-4 py-2 mb-6 ${
                hasBackgroundImage
                  ? "bg-white/15 border border-white/30 text-white backdrop-blur-sm"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              {entity && (
                <CompanyLogo
                  company={entity}
                  size="sm"
                  className={hasBackgroundImage ? "ring-2 ring-white/40" : ""}
                />
              )}
              <span
                className={`font-medium ${
                  hasBackgroundImage ? "text-white" : ""
                }`}
              >
                {entity?.name}
              </span>
            </div>

            {/* Title */}
            <h3
              className={`capitalize text-3xl lg:text-4xl font-semibold tracking-tight mb-4 leading-tight ${
                hasBackgroundImage
                  ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
                  : ""
              }`}
            >
              {offer.title}
            </h3>

            {/* Description */}
            {offer.description && offer.description[0]?.children?.[0]?.text && (
              <p
                className={`text-xl mb-6 leading-relaxed ${
                  hasBackgroundImage ? "text-white/90" : "text-muted-foreground"
                }`}
              >
                {offer.description[0].children[0].text}
              </p>
            )}

            {/* Date Info */}
            {(offer.startDate || offer.endDate) && (
              <div
                className={`flex items-center gap-2 mb-8 ${
                  hasBackgroundImage ? "text-white/90" : "text-muted-foreground"
                }`}
              >
                <Clock
                  className={`w-5 h-5 ${
                    hasBackgroundImage ? "text-white/90" : ""
                  }`}
                />
                <span className="text-lg">
                  {offer.endDate && `ساري حتى ${formatDate(offer.endDate)}`}
                  {!offer.endDate &&
                    offer.startDate &&
                    `بدأ في ${formatDate(offer.startDate)}`}
                </span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className={`cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-1 transition-colors ${
                  hasBackgroundImage
                    ? "bg-white text-black ring-white/0 hover:bg-white/90"
                    : "bg-primary text-primary-foreground ring-primary hover:opacity-90"
                }`}
              >
                عرض التفاصيل
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50/30 rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-50/30 rounded-full translate-y-32 -translate-x-32"></div>
    </div>
  );
}
