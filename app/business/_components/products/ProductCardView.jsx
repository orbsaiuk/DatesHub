"use client";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductActions from "./ProductActions";
import ProductSkeletonLoader from "./ProductSkeletonLoader";
import ProductEmptyState from "./ProductEmptyState";
import Image from "next/image";

// Currency symbols mapping
const currencySymbols = {
  SAR: "ر.س",
  AED: "د.إ",
  KWD: "د.ك",
  QAR: "ر.ق",
  BHD: "د.ب",
  OMR: "ر.ع",
  JOD: "د.أ",
  LBP: "ل.ل",
  EGP: "ج.م",
  IQD: "د.ع",
  SYP: "ل.س",
  YER: "ر.ي",
};

const getCurrencySymbol = (currency) => currencySymbols[currency] || currency;

// Weight unit symbols
const weightUnitSymbols = {
  kg: "كغ",
  g: "جم",
};

const getWeightUnitSymbol = (unit) => weightUnitSymbols[unit] || unit;

export default function ProductCardView({
  pageItems,
  isLoading,
  pending,
  onDelete,
  onUpdated,
  query,
  onClearFilters,
}) {
  return (
    <div className="lg:hidden space-y-5 px-1">
      {isLoading ? (
        <ProductSkeletonLoader type="card" count={3} />
      ) : pageItems.length > 0 ? (
        pageItems.map((product) => (
          <div
            key={product._id}
            className={cn(
              "rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md",
              pending.id === product._id &&
                pending.type === "delete" &&
                "animate-pulse bg-red-50 opacity-60 scale-95",
              pending.id === product._id &&
                pending.type === "toggle" &&
                "opacity-75"
            )}
          >
            <div className="flex flex-col gap-4">
              {/* Product Header - Title and Actions */}
              <div className="flex items-center justify-between w-full">
                <h3 className="font-medium text-base capitalize truncate">
                  {product.title}
                </h3>
                <ProductActions
                  product={product}
                  pending={pending}
                  onDelete={onDelete}
                  onUpdated={onUpdated}
                  className="h-9 w-9 flex-shrink-0"
                />
              </div>

              {/* Product Content */}
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {product.image?.asset?.url ? (
                    <Image
                      src={product.image.asset.url}
                      alt={product.title}
                      className="h-20 w-20 rounded-lg object-cover ring-1 ring-gray-200"
                      loading="lazy"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="h-7 w-7 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  {/* Price and Quantity */}
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-muted-foreground min-w-[3rem]">
                        السعر:{" "}
                      </span>
                      {product.price ? (
                        <span className="font-medium text-green-600 text-base">
                          {product.price.toLocaleString("ar-EG")}{" "}
                          {getCurrencySymbol(product.currency)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground min-w-[3rem]">
                        الكمية:{" "}
                      </span>
                      {product.quantity !== undefined ? (
                        <span
                          className={cn(
                            "font-medium text-base",
                            product.quantity === 0
                              ? "text-red-600"
                              : product.quantity < 10
                                ? "text-orange-600"
                                : "text-green-600"
                          )}
                        >
                          {product.quantity}{" "}
                          {getWeightUnitSymbol(product.weightUnit)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>

                    {/* Display product description if available */}
                    {product.description &&
                      product.description[0]?.children?.[0]?.text && (
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {product.description[0].children[0].text}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <ProductEmptyState
          query={query}
          onClearFilters={onClearFilters}
          variant="card"
        />
      )}
    </div>
  );
}
