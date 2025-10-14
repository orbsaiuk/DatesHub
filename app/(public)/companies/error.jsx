"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw } from "lucide-react";

export default function CompaniesError({ error, reset }) {
  useEffect(() => {
    // Error reporting service can be added here
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Building2 className="size-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">تعذر تحميل قائمة الشركات</h2>
          <p className="text-sm text-muted-foreground">
            حدث خطأ أثناء تحميل الشركات. يرجى المحاولة مرة أخرى.
          </p>
        </div>

        <Button onClick={reset} className="gap-2">
          <RefreshCw className="size-4" />
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}
