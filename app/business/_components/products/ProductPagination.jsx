"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductPagination({
    totalPages,
    currentPage,
    onPageChange,
}) {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="cursor-pointer"
            >
                <ChevronRight className="h-4 w-4" />
                السابق
            </Button>

            <div className="flex items-center gap-1">
                {visiblePages.map((page, index) => (
                    <div key={index}>
                        {page === "..." ? (
                            <span className="px-3 py-2 text-sm text-muted-foreground">
                                ...
                            </span>
                        ) : (
                            <Button
                                onClick={() => onPageChange(page)}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className="cursor-pointer w-10 h-10"
                            >
                                {page}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="cursor-pointer"
            >
                التالي
                <ChevronLeft className="h-4 w-4" />
            </Button>
        </div>
    );
}