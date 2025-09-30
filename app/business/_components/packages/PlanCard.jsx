"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Users, ArrowUp } from "lucide-react";

export default function PlanCard({
  plan,
  tier,
  icon,
  isPopular,
  isCurrent,
  canUpgradeToThis,
  canDowngradeToThis,
  loading,
  onChoose,
  formatPrice,
}) {
  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-lg w-full h-full flex flex-col ${
        isPopular ? "ring-2 ring-primary shadow-lg lg:scale-105" : ""
      } ${isCurrent ? "border-green-500 bg-green-50/50" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 sm:px-4 sm:py-1 text-xs sm:text-sm">
            <Star className="w-3 h-3 mr-1" />
الأكثر شعبية
          </Badge>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 right-2 sm:right-4 z-10">
          <Badge
            variant="secondary"
            className="bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            الباقة الحالية
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4 px-4 sm:px-6">
        <div className="flex justify-center mb-3">{icon}</div>
        <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
        <p className="text-sm text-muted-foreground px-2">{plan.description}</p>
        <div className="mt-4">
          <div className="text-3xl sm:text-4xl font-bold">
            {formatPrice(
              plan.price?.amount || 0,
              plan.price?.currency,
              plan.price?.interval || "month"
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 flex-grow flex flex-col">
        <div className="space-y-3 flex-grow">
          {plan.features?.slice(0, 6).map((feature, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium leading-tight block">
                  {feature.name}
                </span>
                {feature.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                )}
                {feature.limit && feature.limit !== -1 && (
                  <Badge
                    variant="outline"
                    className="text-xs mt-1 inline-block"
                  >
حتى {feature.limit}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {plan.features?.length > 6 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
+{plan.features.length - 6} ميزة إضافية
            </p>
          )}
        </div>

        <div className="pt-4 mt-auto">
          {isCurrent ? (
            <Button
              variant="outline"
              className="w-full h-12 text-sm sm:text-base"
              disabled
            >
              <Check className="w-4 h-4 mr-2" />
الباقة الحالية
            </Button>
          ) : canUpgradeToThis ? (
            <Button
              className="w-full h-12 text-sm sm:text-base cursor-pointer touch-manipulation"
              onClick={onChoose}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <ArrowUp className="w-4 h-4 mr-2" />
              )}
الترقية إلى {plan.name}
            </Button>
          ) : canDowngradeToThis ? (
            <Button
              variant="outline"
              className="w-full h-12 text-sm sm:text-base cursor-pointer touch-manipulation"
              onClick={onChoose}
              disabled={loading}
            >
التراجع إلى {plan.name}
            </Button>
          ) : tier === "enterprise" ? (
            <Button
              variant="outline"
              className="w-full h-12 text-sm sm:text-base touch-manipulation"
            >
              <Users className="w-4 h-4 mr-2" />
تواصل مع المبيعات
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full h-12 text-sm sm:text-base"
              disabled
            >
غير متاح
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
