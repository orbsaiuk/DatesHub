import { urlFor } from "@/sanity/lib/image";
import ImageOptimized from "@/components/ImageOptimized";
import { Package, ShoppingCart } from "lucide-react";
import { formatArabicPrice, formatArabicQuantity } from "@/lib/utils/arabic";

export default function ProductCard({ product, tenant }) {
  const imageUrl = product.image?.asset?.url
    ? urlFor(product.image).width(400).height(300).url()
    : null;

  const formatPrice = (price, currency = "SAR") => {
    return formatArabicPrice(price, currency);
  };

  const formatQuantity = (quantity, weightUnit = "kg") => {
    return formatArabicQuantity(quantity, weightUnit);
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
      <div className="relative aspect-[4/2] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <ImageOptimized
            src={imageUrl}
            alt={`${product.title} - منتج من ${tenant?.name || "الشركة"}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center justify-between w-full gap-1">
            <h4 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {product.title}
            </h4>
            <span className="font-semibold text-primary">
              {formatPrice(product.price, product.currency)} /
              {formatQuantity(product.quantity, product.weightUnit)}
            </span>
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
