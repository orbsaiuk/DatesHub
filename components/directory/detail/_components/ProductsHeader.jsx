import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductsHeader({ total }) {
  const getProductCountText = (count) => {
    if (count === 1) return "منتج واحد";
    if (count === 2) return "منتجان";
    return `${count} منتجات`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Package className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold text-gray-900">منتجاتنا</h3>
      </div>
      <Badge variant="secondary" className="text-sm">
        {getProductCountText(total)}
      </Badge>
    </div>
  );
}
