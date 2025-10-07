"use client";
import { Search, RefreshCw, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductSearchFilters({
  query,
  setQuery,
  searchLoading,
  error,
  retryCount,
  onRetry,
  sortOrder,
  setSortOrder,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث في المنتجات..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10"
          />
          {searchLoading && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        <div className="w-full sm:w-auto">
          <Select value={sortOrder} onValueChange={setSortOrder} dir="rtl">
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <SelectValue placeholder="ترتيب حسب" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث أولاً</SelectItem>
              <SelectItem value="oldest">الأقدم أولاً</SelectItem>
              <SelectItem value="price-high">السعر: من الأعلى</SelectItem>
              <SelectItem value="price-low">السعر: من الأقل</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && retryCount > 0 && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="cursor-pointer"
        >
          <RefreshCw className="me-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
