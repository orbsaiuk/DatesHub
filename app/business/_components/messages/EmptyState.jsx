"use client";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyState({
  searchQuery,
  activeFilter,
  tenantType = "company",
}) {
  const hasFilters = searchQuery || activeFilter !== "all";

  return (
    <Card>
      <CardContent className="p-6 sm:p-8 text-center">
        <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          {hasFilters ? "لم يتم العثور على رسائل" : "لا توجد رسائل بعد"}
        </h3>
      </CardContent>
    </Card>
  );
}
