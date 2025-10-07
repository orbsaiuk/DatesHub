"use client";
import { ShoppingBag, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductEmptyState({
    query,
    onClearFilters,
    variant = "card",
}) {
    const hasFilters = query;

    if (variant === "table") {
        return (
            <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        {hasFilters ? (
                            <>
                                <Search className="h-12 w-12 text-muted-foreground/50" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">لا توجد نتائج</h3>
                                    <p className="text-sm text-muted-foreground">
                                        لم نجد أي منتجات تطابق معايير البحث الحالية
                                    </p>
                                </div>
                                <Button
                                    onClick={onClearFilters}
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                >
                                    <Filter className="me-2 h-4 w-4" />
                                    مسح الفلاتر
                                </Button>
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">لا توجد منتجات</h3>
                                    <p className="text-sm text-muted-foreground">
                                        ابدأ بإضافة منتجك الأول
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
            {hasFilters ? (
                <>
                    <Search className="h-12 w-12 text-muted-foreground/50" />
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">لا توجد نتائج</h3>
                        <p className="text-sm text-muted-foreground">
                            لم نجد أي منتجات تطابق معايير البحث الحالية
                        </p>
                    </div>
                    <Button
                        onClick={onClearFilters}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                    >
                        <Filter className="me-2 h-4 w-4" />
                        مسح الفلاتر
                    </Button>
                </>
            ) : (
                <>
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">لا توجد منتجات</h3>
                        <p className="text-sm text-muted-foreground">
                            ابدأ بإضافة منتجك الأول
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}