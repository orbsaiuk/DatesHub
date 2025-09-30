"use client";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

export default function BlogEmptyState({ query, onCreate, onClearQuery }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
      <div className="rounded-full bg-gray-100 p-4">
        <FilePlus2 className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">لا توجد مقالات</h3>
      <div className="flex gap-2">
        {query ? (
          <Button
            variant="outline"
            onClick={onClearQuery}
            className="cursor-pointer"
          >
            مسح البحث
          </Button>
        ) : (
          <p className="text-base text-muted-foreground max-w-sm">
            انشئ مقالك الأول للبدء
          </p>
        )}
      </div>
    </div>
  );
}
