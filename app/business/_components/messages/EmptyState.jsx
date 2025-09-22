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
      return "Try adjusting your search or filters";
    }
    return tenantType === "company"
      ? "Start a conversation with a client to see messages here"
      : "Start a conversation with a partner company to see messages here";
  };

  return (
    <Card>
      <CardContent className="p-6 sm:p-8 text-center">
        <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-semibold mb-2">
          {hasFilters ? "No messages found" : "No messages yet"}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          {getDescription()}
        </p>
      </CardContent>
    </Card>
  );
}
