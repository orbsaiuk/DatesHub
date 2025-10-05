import { Badge } from "@/components/ui/badge";

export default function ReviewsHeader({ company }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          التقييمات
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          إدارة والرد على تقييمات العملاء لشركة {company.name}
        </p>
      </div>
      <div className="sm:text-right">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <span className="text-xl sm:text-2xl font-bold">
            {company.rating ? company.rating.toFixed(1).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : "٠.٠"}
          </span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-base sm:text-lg ${i < Math.floor(company.rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                  }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {company.ratingCount || 0} إجمالي التقييمات
        </p>
      </div>
    </div>
  );
}
