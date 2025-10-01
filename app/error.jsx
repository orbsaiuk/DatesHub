"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="size-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            عذراً، حدث خطأ غير متوقع
          </h1>
          <p className="text-muted-foreground">
            نواجه مشكلة في معالجة طلبك. يرجى المحاولة مرة أخرى.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-right">
            <p className="text-xs font-mono text-destructive break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
          >
            حاول مرة أخرى
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            العودة إلى الصفحة الرئيسية
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          إذا استمرت المشكلة، يرجى{" "}
          <a
            href="/contact"
            className="text-primary underline hover:no-underline"
          >
            الاتصال بالدعم
          </a>
        </p>
      </div>
    </div>
  );
}
