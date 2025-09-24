"use client";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyState({
  searchQuery,
  activeFilter,
  tenantType = "company",
}) {
  const hasFilters = searchQuery || activeFilter !== "all";

  const getDescription = () => {
    if (hasFilters) {
      return "جرب تعديل البحث أو المرشحات";
    }
    return tenantType === "company"
      ? "ابدأ محادثة مع عميل لرؤية الرسائل هنا"
      : "ابدأ محادثة مع شركة شريكة لرؤية الرسائل هنا";
  };

  return (
    <Card>
      <CardContent className="p-6 sm:p-8 text-center">
        <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          {hasFilters ? "لم يتم العثور على رسائل" : "لا توجد رسائل بعد"}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          {getDescription()}
        </p>
      </CardContent>
    </Card>
  );
}
