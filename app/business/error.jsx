"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function BusinessError({ error, reset }) {
  useEffect(() => {
    // Error reporting service can be added here
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="size-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            خطأ في لوحة التحكم
          </h2>
          <p className="text-sm text-muted-foreground">
            حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="bg-muted rounded-lg p-3 text-right">
            <p className="text-xs font-mono text-destructive break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="w-full sm:w-auto"
          >
            حاول مرة أخرى
          </Button>
          <Button
            onClick={() => (window.location.href = "/business")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </div>
    </div>
  );
}
