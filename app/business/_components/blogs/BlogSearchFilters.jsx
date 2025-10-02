"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";

export default function BlogSearchFilters({
  query,
  setQuery,
  status,
  setStatus,
  searchLoading,
  error,
  retryCount,
  onRetry,
}) {


  return (
    <div className="space-y-3 md:space-y-0 md:flex md:flex-row md:gap-4 md:items-center">
      <div className="relative flex-1 md:max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث في المدونة..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-11 md:h-10 text-base md:text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
        />
        {searchLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="flex gap-3 md:gap-2">
        <Select value={status} onValueChange={setStatus} dir="rtl">
          <SelectTrigger className="flex-1 md:w-40 h-11 md:h-10 text-base md:text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="published">منشور</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>

        {error && retryCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-11 md:h-10 px-4 md:px-3 text-orange-600 border-orange-200 hover:bg-orange-50 whitespace-nowrap"
          >
            <RefreshCw className="h-4 w-4 me-2 md:me-1" />
            <span className="hidden sm:inline">إعادة المحاولة</span>
          </Button>
        )}
      </div>
    </div>
  );
}
