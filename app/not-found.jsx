"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search, HelpCircle } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  // Set document title for client component
  useEffect(() => {
    document.title = "صفحة غير موجودة";
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Large 404 Display */}
        <div className="space-y-4">
          <div className="text-8xl md:text-9xl font-bold text-muted-foreground/30 select-none">
            404
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <HelpCircle className="h-16 w-16 text-primary/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 pt-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            الصفحة غير موجودة
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون قد تم
            نقلها أو حذفها، أو قد تكون قد أدخلت عنوان URL خاطئ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto cursor-pointer">
              <Home className="h-4 w-4 mr-2" />
              العودة إلى الرئيسية
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
        </div>
      </div>
    </div>
  );
}
