"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart3, Settings, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";

export default function CurrentPlanCard({
  subscription,
  limits,
  icon,
  getUsagePercentage,
  tenantType,
  tenantId,
}) {
  const [billingLoading, setBillingLoading] = useState(false);

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const response = await fetch("/api/subscriptions/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantType,
          tenantId,
        }),
      });

      if (response.ok) {
        const { portalUrl } = await response.json();
        window.open(portalUrl, "_blank");
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في فتح بوابة الدفع");
      }
    } catch (error) {
      toast.error("حدث خطأ ما. يرجى المحاولة مرة أخرى.");
    } finally {
      setBillingLoading(false);
    }
  };

  // Translate subscription status to Arabic
  const translateStatus = (status) => {
    const statusMap = {
      active: "فعال",
      canceled: "ملغي",
      past_due: "متأخر الدفع",
      unpaid: "غير مدفوع",
      trialing: "فترة تجريبية",
      incomplete: "غير مكتمل",
      incomplete_expired: "انتهت صلاحية التجربة",
    };
    return statusMap[status] || status;
  };

  // If no subscription, show free plan card
  const displaySubscription = subscription || {
    plan: { name: "الباقة المجانية" },
    status: "فعال",
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent mx-4 sm:mx-6">
      <CardHeader className="pb-4 sm:pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="flex-shrink-0 mt-1 sm:mt-0">{icon}</div>
            <div className="min-w-0 flex-1">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                <span className="leading-tight">
                  الباقة الحالية: {displaySubscription.plan?.name}
                </span>
                <Badge
                  variant={
                    displaySubscription.status === "active" ||
                    displaySubscription.status === "فعال"
                      ? "default"
                      : "secondary"
                  }
                  className="w-fit text-xs sm:text-sm"
                >
                  {translateStatus(displaySubscription.status)}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {subscription?.endDate && (
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="leading-tight">
                      يتجدد في{" "}
                      {new Date(subscription.endDate).toLocaleDateString(
                        "ar-EG"
                      )}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {subscription?.stripeCustomerId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageBilling}
              disabled={billingLoading}
              className="flex items-center space-x-2 cursor-pointer touch-manipulation w-full sm:w-auto h-10 sm:h-auto px-4 text-sm whitespace-nowrap"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>
                {billingLoading ? "جاري التحميل..." : "إدارة الفواتير"}
              </span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </Button>
          )}
        </div>
      </CardHeader>

      {subscription?.currentUsage && limits && (
        <CardContent className="pt-0">
          <h4 className="font-medium mb-4 flex items-center space-x-2 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>نظرة عامة على الاستخدام</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Object.entries(limits).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-muted-foreground">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="font-medium">
                    {subscription.currentUsage[key] || 0} /{" "}
                    {value === -1 ? "∞" : value}
                  </span>
                </div>
                {value !== -1 && (
                  <Progress
                    value={getUsagePercentage(
                      subscription.currentUsage[key] || 0,
                      value
                    )}
                    className="h-2"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
