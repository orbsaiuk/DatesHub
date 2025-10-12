import { Package } from "lucide-react";

export default function EmptyProductsState() {
  return (
    <div className="text-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
      <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
      <h4 className="text-lg font-semibold text-gray-700 mb-2">
        لا توجد منتجات حالياً
      </h4>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">
        تابع معنا لاكتشاف أحدث المنتجات والخدمات المتاحة
      </p>
    </div>
  );
}
