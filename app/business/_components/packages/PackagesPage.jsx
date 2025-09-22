"use client";

import { useState } from "react";
import { Shield, Zap, Crown } from "lucide-react";
import { toast } from "sonner";

// Import sub-components
import PageHeader from "./PageHeader";
import LoadingState from "./LoadingState";
import CurrentPlanCard from "./CurrentPlanCard";
import PlansGrid from "./PlansGrid";
import UpgradeConfirmDialog from "./UpgradeConfirmDialog";
import FAQSection from "./FAQSection";

export default function PackagesPage({
  tenantType,
  tenantId,
  currentSubscription,
  allPlans,
}) {
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState("month");
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(null);

  // Infer plan tier from slug or name ("free", "pro", fallback "enterprise")
  const getPlanTier = (plan) => {
    const key = (
      plan?.slug?.current ||
      plan?.slug ||
      plan?.name ||
      ""
    ).toLowerCase();
    if (key.includes("free")) return "free";
    if (key.includes("pro")) return "pro";
  };

  // Sort plans by tier and interval
  const sortedPlans = (allPlans || [])
    .slice()
    .map((p) => ({ ...p, tier: getPlanTier(p) }))
    .sort((a, b) => {
      const tierOrder = { free: 0, pro: 1, enterprise: 2 };
      const t = tierOrder[a.tier] - tierOrder[b.tier];
      if (t !== 0) return t;
      const ai = a?.price?.interval || "month";
      const bi = b?.price?.interval || "month";
      // month before year
      return ai === bi ? 0 : ai === "month" ? -1 : 1;
    });

  // Show matching interval plans and always include Free
  const visiblePlans = sortedPlans.filter((p) => {
    const isFree = (p?.price?.amount || 0) === 0 || getPlanTier(p) === "free";
    if (isFree) return true;
    const interval = p?.price?.interval || "month";
    return billingInterval === "year"
      ? interval === "year"
      : interval === "month";
  });

  const handleUpgrade = async (planId, planName, stripePriceId) => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantType,
          tenantId,
          planId,
          stripePriceId,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.checkoutUrl) {
          toast.success(`Redirecting to checkout for ${planName}...`);
          window.location.href = result.checkoutUrl;
        } else if (result.subscription) {
          // Free plan - no checkout needed
          toast.success(`Successfully subscribed to ${planName}!`);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to process subscription");
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setShowUpgradeConfirm(null);
    }
  };

  const getCurrentPlanId = () => {
    return currentSubscription?.plan?._id || null;
  };

  const isCurrentPlan = (planId) => {
    return getCurrentPlanId() === planId;
  };

  const canUpgrade = (plan) => {
    const currentPlan = currentSubscription?.plan;
    if (!currentPlan) return plan.tier !== "free";

    const tierOrder = { free: 0, pro: 1, enterprise: 2 };
    return tierOrder[plan.tier] > tierOrder[currentPlan.tier];
  };

  const canDowngrade = (plan) => {
    const currentPlan = currentSubscription?.plan;
    if (!currentPlan) return false;

    const tierOrder = { free: 0, pro: 1, enterprise: 2 };
    return tierOrder[plan.tier] < tierOrder[currentPlan.tier];
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatPrice = (amount, currency, interval) => {
    if (amount === 0) return "Free";
    return `$${amount}/${interval === "month" ? "mo" : "yr"}`;
  };

  // If both monthly and annual Pro exist, compute savings vs monthly*12
  const findPlanBy = (tier, interval) =>
    sortedPlans.find(
      (p) =>
        getPlanTier(p) === tier && (p?.price?.interval || "month") === interval
    );
  const monthlyPro = findPlanBy("pro", "month");
  const annualPro = findPlanBy("pro", "year");
  const annualSavings =
    monthlyPro && annualPro
      ? Math.max(
          0,
          ((monthlyPro.price.amount * 12 - annualPro.price.amount) /
            (monthlyPro.price.amount * 12)) *
            100
        ).toFixed(0)
      : 0;

  const getPlanIcon = (tier) => {
    switch (tier) {
      case "free":
        return <Shield className="w-6 h-6" />;
      case "pro":
        return <Zap className="w-6 h-6" />;
      case "enterprise":
        return <Crown className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  if (!allPlans?.length) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-12">
        {/* Header */}
        <PageHeader
          tenantType={tenantType}
          billingInterval={billingInterval}
          onBillingChange={setBillingInterval}
          annualSavings={annualSavings}
        />

        {/* Current Plan Status */}
        {currentSubscription && (
          <CurrentPlanCard
            subscription={currentSubscription}
            limits={currentSubscription.plan?.limits}
            icon={getPlanIcon(getPlanTier(currentSubscription.plan))}
            getUsagePercentage={getUsagePercentage}
            tenantType={tenantType}
            tenantId={tenantId}
          />
        )}

        {/* Plans Grid */}
        <PlansGrid
          plans={visiblePlans}
          getPlanTier={getPlanTier}
          getPlanIcon={getPlanIcon}
          isCurrentPlan={isCurrentPlan}
          canUpgrade={canUpgrade}
          canDowngrade={canDowngrade}
          loading={loading}
          onPlanSelect={setShowUpgradeConfirm}
          formatPrice={formatPrice}
        />

        {/* Upgrade Confirmation Dialog */}
        <UpgradeConfirmDialog
          plan={showUpgradeConfirm}
          isOpen={!!showUpgradeConfirm}
          onClose={() => setShowUpgradeConfirm(null)}
          onConfirm={handleUpgrade}
          loading={loading}
          formatPrice={formatPrice}
          billingInterval={billingInterval}
          canUpgrade={canUpgrade}
        />

        {/* FAQ Section */}
        <FAQSection />
      </div>
    </div>
  );
}
