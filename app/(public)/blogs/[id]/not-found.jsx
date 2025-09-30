import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h2 className="text-2xl font-semibold mb-2">لم يتم العثور على المدونة</h2>
      <p className="text-muted-foreground mb-6">
        المقالة التي تبحث عنها غير موجودة أو ربما تم حذفها.
      </p>
      <Link href="/" className="text-primary underline">
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
