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
        <div className="lg:hidden space-y-4">
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
                        <div className="flex items-start gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                                {product.image?.asset?.url ? (
                                    <Image
                                        src={product.image.asset.url}
                                        alt={product.title}
                                        className="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-200"
                                        loading="lazy"
                                        width={64}
                                        height={64}
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <ShoppingBag className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-medium text-sm capitalize truncate">
                                        {product.title}
                                    </h3>
                                    <ProductActions
                                        product={product}
                                        pending={pending}
                                        onDelete={onDelete}
                                        onUpdated={onUpdated}
                                        className="h-8 w-8 flex-shrink-0"
                                    />
                                </div>

                                <div className="mt-2 space-y-2">
                                    {/* Price and Quantity */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">السعر: </span>
                                            {product.price ? (
                                                <span className="font-medium text-green-600">
                                                    {product.price.toLocaleString('ar-EG')} {getCurrencySymbol(product.currency)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">الكمية: </span>
                                            {product.quantity !== undefined ? (
                                                <span className={cn(
                                                    "font-medium",
                                                    product.quantity === 0 ? "text-red-600" :
                                                        product.quantity < 10 ? "text-orange-600" : "text-green-600"
                                                )}>
                                                    {product.quantity} {getWeightUnitSymbol(product.weightUnit)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
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