"use client";

import { useState, useEffect } from "react";
import { urlFor } from "@/sanity/lib/image";
import { Clock, Tag, Sparkles, Timer } from "lucide-react";
import ImageOptimized from "@/components/ImageOptimized";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
// Dynamic import for Autoplay to avoid SSR issues

export default function DirectoryOffersSection({ tenant, tenantType }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplayPlugin, setAutoplayPlugin] = useState(null);

  useEffect(() => {
    // Load Autoplay plugin dynamically to avoid SSR issues
    const loadAutoplay = async () => {
      if (typeof window !== "undefined") {
        try {
          const { default: Autoplay } = await import("embla-carousel-autoplay");
          setAutoplayPlugin(Autoplay({ delay: 5000, stopOnMouseEnter: true }));
        } catch (error) {
          console.error("Failed to load autoplay plugin:", error);
        }
      }
    };
    loadAutoplay();

    const fetchOffers = async () => {
      if (!tenant?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/offers/tenant?tenantType=${tenantType}&tenantId=${tenant.id}&publicView=true`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.items) {
          // Filter out expired offers as a safety net
          const activeOffers = data.items.filter((offer) => {
            if (offer.status !== "active") return false;
            if (!offer.endDate) return true;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endDate = new Date(offer.endDate);
            endDate.setHours(0, 0, 0, 0);

            return endDate >= today;
          });

          // Sort offers by end date - offers ending soon appear first
          const sortedOffers = activeOffers.sort((a, b) => {
            // If offer has no end date, put it at the end
            if (!a.endDate && !b.endDate) return 0;
            if (!a.endDate) return 1;
            if (!b.endDate) return -1;

            const endDateA = new Date(a.endDate);
            const endDateB = new Date(b.endDate);

            // Sort by end date ascending (earliest first)
            return endDateA - endDateB;
          });

          setOffers(sortedOffers);
        } else {
          setOffers([]);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();

    // Fetch products
    const fetchProducts = async () => {
      if (!tenant?.id) {
        setProductsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/products/tenant?tenantType=${tenantType}&tenantId=${tenant.id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.items) {
          setProducts(data.items);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [tenant?.id, tenantType]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 min-h-[280px] animate-pulse border-2 border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="text-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
          <Tag className="h-8 w-8 text-gray-400" />
        </div>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          لا توجد عروض حالياً
        </h4>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          تابع معنا لاكتشاف أحدث العروض والخصومات الحصرية
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-gray-900">عروض حصرية</h3>
        </div>
      </div>

      <Carousel
        setApi={setCarouselApi}
        opts={{ loop: true, direction: "rtl" }}
        plugins={offers.length > 1 && autoplayPlugin ? [autoplayPlugin] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {offers.map((offer, index) => (
            <CarouselItem key={offer._id || index} className="pl-0">
              <DirectoryOfferCard offer={offer} tenant={tenant} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {offers.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 mt-4"
          role="tablist"
          aria-label="ترقيم العروض"
        >
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`اذهب إلى العرض ${index + 1}`}
              aria-selected={index === currentIndex}
              role="tab"
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${index === currentIndex
                ? "bg-primary w-8"
                : "bg-gray-300 hover:bg-gray-400 w-2"
                }`}
            />
          ))}
        </div>
      )}

      {/* Products Section */}
      <div className="mt-12">
        <DirectoryProductsSection
          products={products}
          loading={productsLoading}
          tenant={tenant}
        />
      </div>
    </div>
  );
}

function DirectoryOfferCard({ offer, tenant }) {
  const imageUrl = offer.image?.asset?.url
    ? urlFor(offer.image).width(600).height(300).url()
    : null;
  const hasBackgroundImage = Boolean(imageUrl);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If it's within the next 7 days, show relative time
    if (diffDays === 1) {
      return `غداً`;
    }

    // Otherwise show the full date
    return date.toLocaleDateString("ar-EG", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if offer ends today
  const isLastDay = () => {
    if (!offer.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(offer.endDate);
    endDate.setHours(0, 0, 0, 0);
    return today.getTime() === endDate.getTime();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[280px] group">
      {/* Background Image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <ImageOptimized
            src={imageUrl}
            alt={`${offer.title} - عرض من ${tenant?.name || "الشركة"}`}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
      )}

      {/* Enhanced Last Day Badge */}
      {isLastDay() && (
        <div className="absolute top-4 left-4 z-20">
          <div className="relative">
            <Badge
              variant="destructive"
              className="animate-bounce bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 text-sm font-black shadow-xl border-2 border-red-400 rounded-full"
            >
              <Timer className="w-4 h-4 ml-1 inline animate-spin" />
              آخر يوم في العرض !
            </Badge>
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30 scale-110"></div>
          </div>
        </div>
      )}

      {/* New Offer Badge */}
      {!isLastDay() && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-primary text-white px-3 py-1.5 text-xs font-bold shadow-lg">
            <Sparkles className="w-3 h-3 mr-1 inline" />
            عرض مميز
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col justify-between min-h-[280px]">
        <div className="space-y-3">
          {/* Title */}
          <h4
            className={`text-2xl font-bold leading-tight ${hasBackgroundImage
              ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              : "text-gray-900"
              }`}
          >
            {offer.title}
          </h4>

          {/* Description */}
          {offer.description && (
            <p
              className={`text-base leading-relaxed line-clamp-2 ${hasBackgroundImage
                ? "text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                : "text-gray-600"
                }`}
            >
              {Array.isArray(offer.description)
                ? offer.description[0]?.children?.[0]?.text || ""
                : typeof offer.description === "string"
                  ? offer.description
                  : ""}
            </p>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {/* Enhanced Date Info */}
          {!isLastDay() && offer.endDate && (
            <div
              className={`w-fit flex items-center justify-center gap-2 px-4 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${hasBackgroundImage
                ? "bg-white/25 text-white border border-white/40 hover:bg-white/30"
                : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200"
                }`}
            >
              <Clock className="w-5 h-5" />
              <div className="text-center">
                <div className="text-sm font-bold">
                  العرض ساري حتى ({formatDate(offer.endDate)})
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      {!hasBackgroundImage && (
        <>
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-20 translate-x-20 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full translate-y-16 -translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
        </>
      )}

      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}

function DirectoryProductsSection({ products, loading, tenant }) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-xl h-80 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-xl"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          لا توجد منتجات حالياً
        </h4>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          تابع معنا لاكتشاف أحدث المنتجات والخدمات المتاحة
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-gray-900">منتجاتنا</h3>
        </div>
        <Badge variant="secondary" className="text-sm">
          {products.length} منتج
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} tenant={tenant} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, tenant }) {
  const imageUrl = product.image?.asset?.url
    ? urlFor(product.image).width(400).height(300).url()
    : null;

  const formatPrice = (price, currency = "SAR") => {
    if (!price || price === 0) return "السعر عند الطلب";
    return `${price.toLocaleString("ar-SA")} ${currency}`;
  };

  const formatQuantity = (quantity, weightUnit = "kg") => {
    if (!quantity || quantity === 0) return "الكمية عند الطلب";
    return `${quantity.toLocaleString("ar-SA")} ${weightUnit}`;
  };

  const getDescription = (description) => {
    if (!description) return "";
    if (Array.isArray(description)) {
      return description[0]?.children?.[0]?.text || "";
    }
    return typeof description === "string" ? description : "";
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <ImageOptimized
            src={imageUrl}
            alt={`${product.title} - منتج من ${tenant?.name || "الشركة"}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

        {/* Shopping cart icon on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {product.title}
        </h4>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-primary">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>
          <div className="text-gray-600">
            {formatQuantity(product.quantity, product.weightUnit)}
          </div>
        </div>

        {/* Description */}
        {getDescription(product.description) && (
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {getDescription(product.description)}
          </p>
        )}

        {/* Bottom border accent */}
        <div className="h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      </div>
    </div>
  );
}
