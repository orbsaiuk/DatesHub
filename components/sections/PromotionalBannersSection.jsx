"use client";

import { useState, useEffect } from "react";
import { urlFor } from "@/sanity/lib/image";
import { ArrowRight, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import ImageOptimized from "@/components/ImageOptimized";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function PromotionalBannersSection({ targetAudience = "all" }) {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carouselApi, setCarouselApi] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const encodedAudience = encodeURIComponent(targetAudience);
                const response = await fetch(`/api/promotional-banners/public?audience=${encodedAudience}`);
                const data = await response.json();

                if (data.success) {
                    setBanners(data.banners || []);
                }
            } catch (error) {
                console.error('Error fetching promotional banners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, [targetAudience]);

    useEffect(() => {
        if (!carouselApi) return;
        const onSelect = () => setCurrentIndex(carouselApi.selectedScrollSnap());
        onSelect();
        carouselApi.on("select", onSelect);
        return () => {
            carouselApi.off("select", onSelect);
        };
    }, [carouselApi]);

    if (!banners.length) {
        return null;
    }

    if (loading) {
        return (
            <section className="py-12 sm:py-16 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border min-h-[280px] animate-pulse">
                        <div className="absolute inset-0 bg-gray-100" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 sm:py-16 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Carousel
                    setApi={setCarouselApi}
                    opts={{ loop: true }}
                    plugins={[Autoplay({ delay: 4000, stopOnMouseEnter: true })]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-0">
                        {banners.map((banner, index) => (
                            <CarouselItem key={banner._id || index} className="pl-0">
                                <SimpleBanner banner={banner} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {banners.length > 1 && (
                        <>
                            <CarouselPrevious className="hidden sm:flex" />
                            <CarouselNext className="hidden sm:flex" />
                        </>
                    )}
                </Carousel>

                {banners.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => carouselApi?.scrollTo(index)}
                                className={`h-2 rounded-full transition-all duration-200 ${index === currentIndex
                                    ? "bg-primary w-6"
                                    : "bg-gray-300 hover:bg-gray-400 w-2"
                                    }`}
                                aria-label={`اذهب إلى البانر ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function SimpleBanner({ banner }) {
    const imageUrl = banner.image?.asset?.url
        ? urlFor(banner.image).width(800).height(400).url()
        : null;
    const hasBackgroundImage = Boolean(imageUrl);

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        // Format in Arabic with Arabic numerals
        const formatted = date.toLocaleDateString("ar-EG", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });

        // Convert to Arabic numerals
        return formatted.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
    };

    const isExternalLink = banner.ctaLink?.startsWith('http');

    return (
        <div className="relative overflow-hidden rounded-xl bg-white shadow-lg border min-h-[280px]">
            {/* Background Image */}
            {imageUrl && (
                <div className="absolute inset-0">
                    <ImageOptimized
                        src={imageUrl}
                        alt={`${banner.title} - بانر ترويجي`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 800px"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-transparent"></div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                        {/* Subtitle */}
                        {banner.subtitle && (
                            <div className="mb-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${hasBackgroundImage
                                    ? "bg-white/20 text-white"
                                    : "bg-blue-50 text-blue-700"
                                    }`}>
                                    {banner.subtitle}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h3 className={`text-3xl lg:text-4xl font-bold mb-4 leading-tight ${hasBackgroundImage
                            ? "text-white"
                            : "text-gray-900"
                            }`}>
                            {banner.title}
                        </h3>

                        {/* Description */}
                        {banner.description && banner.description[0]?.children?.[0]?.text && (
                            <p className={`text-lg mb-6 leading-relaxed ${hasBackgroundImage ? "text-white/90" : "text-gray-600"
                                }`}>
                                {banner.description[0].children[0].text}
                            </p>
                        )}

                        {/* Date Info */}
                        {(banner.startDate || banner.endDate) && (
                            <div className={`flex items-center gap-2 mb-6 text-sm ${hasBackgroundImage ? "text-white/80" : "text-gray-500"
                                }`}>
                                <Clock className="w-4 h-4" />
                                <span>
                                    {banner.endDate && `ساري حتى ${formatDate(banner.endDate)}`}
                                    {!banner.endDate && banner.startDate && `بدأ في ${formatDate(banner.startDate)}`}
                                </span>
                            </div>
                        )}

                        {/* CTA Button */}
                        {isExternalLink ? (
                            <a
                                href={banner.ctaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${hasBackgroundImage
                                    ? "bg-white text-gray-900 hover:bg-gray-100"
                                    : "bg-primary text-white hover:bg-primary/90"
                                    }`}
                            >
                                {banner.ctaText}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : (
                            <Link
                                href={banner.ctaLink}
                                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${hasBackgroundImage
                                    ? "bg-white text-gray-900 hover:bg-gray-100"
                                    : "bg-primary text-white hover:bg-primary/90"
                                    }`}
                            >
                                {banner.ctaText}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}