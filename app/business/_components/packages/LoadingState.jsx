"use client";

export default function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">خطط الاشتراك</h1>
        <p className="text-muted-foreground mt-2">
          جاري تحميل الخطط المتاحة...
        </p>
      </div>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  );
}
