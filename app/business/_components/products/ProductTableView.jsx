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

export default function ProductTableView({
  pageItems,
  isLoading,
  pending,
  onDelete,
  onUpdated,
  query,
  onClearFilters,
}) {
  return (
    <div className="hidden lg:block rounded-xl border bg-card shadow-sm transition-all duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-muted-foreground border-b">
              <th className="px-4 py-3 font-medium">الصورة</th>
              <th className="px-4 py-3 font-medium">العنوان</th>
              <th className="px-4 py-3 font-medium">السعر</th>
              <th className="px-4 py-3 font-medium">الكمية</th>
              <th className="px-4 py-3 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <ProductSkeletonLoader type="table" count={3} />
            ) : pageItems.length > 0 ? (
              pageItems.map((product) => (
                <tr
                  key={product._id}
                  className={cn(
                    "border-t transition-all duration-300 hover:bg-gray-50/50",
                    pending.id === product._id &&
                      pending.type === "delete" &&
                      "animate-pulse bg-red-50 opacity-60 scale-95",
                    pending.id === product._id &&
                      pending.type === "toggle" &&
                      "opacity-75"
                  )}
                >
                  <td className="px-4 py-3">
                    {product.image?.asset?.url ? (
                      <div className="relative">
                        <Image
                          src={product.image.asset.url}
                          alt={product.title}
                          className="h-12 w-12 rounded object-cover ring-1 ring-gray-200 transition-transform duration-200 hover:scale-105"
                          loading="lazy"
                          width={48}
                          height={48}
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium capitalize">
                    {product.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.price ? (
                      <span className="font-medium">
                        {product.price.toLocaleString("ar-EG")}{" "}
                        {getCurrencySymbol(product.currency)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.quantity !== undefined ? (
                      <span className="font-medium">
                        {product.quantity.toLocaleString("ar-EG")}{" "}
                        {getWeightUnitSymbol(product.weightUnit)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <ProductActions
                      product={product}
                      pending={pending}
                      onDelete={onDelete}
                      onUpdated={onUpdated}
                      className="h-8 w-8"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <ProductEmptyState
                query={query}
                onClearFilters={onClearFilters}
                variant="table"
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
