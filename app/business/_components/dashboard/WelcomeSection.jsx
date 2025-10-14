import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function WelcomeSection({ entity, entityType, subscription }) {
  // Debug logging removed

  // Get plan information from subscription
  const getPlanDisplay = () => {
    if (!subscription) {
      return {
        name: "الباقة المجانية",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      };
    }

    const planName =
      subscription.plan?.name?.toLowerCase() || "الباقة المجانية";

    // Color coding based on plan type
    if (planName.includes("pro") || planName.includes("premium")) {
      return {
        name: planName,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      };
    } else if (
      planName.includes("enterprise") ||
      planName.includes("business")
    ) {
      return {
        name: planName,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      };
    } else {
      return {
        name: planName,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      };
    }
  };

  const planDisplay = getPlanDisplay();
  const showUpgrade =
    !subscription || subscription.plan?.name?.toLowerCase().includes("free");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          لوحة التحكم
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
          إدارة ملفك الشخصي، وعرض التحليلات، وتنمية عملك.
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Badge
          variant="outline"
          className={`text-xs sm:text-sm font-medium ${planDisplay.bgColor} ${planDisplay.color} px-2 py-1`}
        >
          {planDisplay.name}
        </Badge>
        {showUpgrade && (
          <Link
            href={`/business/${entityType}/packages`}
            className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium px-3 py-2 underline"
          >
            ترقية
          </Link>
        )}
      </div>
    </div>
  );
}
