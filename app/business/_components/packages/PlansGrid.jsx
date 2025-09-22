"use client";

import PlanCard from "./PlanCard";

export default function PlansGrid({
  plans,
  getPlanTier,
  getPlanIcon,
  isCurrentPlan,
  canUpgrade,
  canDowngrade,
  loading,
  onPlanSelect,
  formatPrice,
}) {
  return (
    <div className="px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const tier = getPlanTier(plan);
          const isPopular =
            tier === "pro" && (plan?.price?.interval || "month") === "month";
          const isCurrent = isCurrentPlan(plan._id);
          const canUpgradeToThis = canUpgrade(plan);
          const canDowngradeToThis = canDowngrade(plan);

          return (
            <PlanCard
              key={plan._id}
              plan={plan}
              tier={tier}
              icon={getPlanIcon(tier)}
              isPopular={isPopular}
              isCurrent={isCurrent}
              canUpgradeToThis={canUpgradeToThis}
              canDowngradeToThis={canDowngradeToThis}
              loading={loading}
              onChoose={() => onPlanSelect(plan)}
              formatPrice={formatPrice}
            />
          );
        })}
      </div>
    </div>
  );
}
