"use client";

import PlanCard from "./PlanCard";

export default function PlansGrid({
  plans,
  getPlanTier,
  getPlanIcon,
  isCurrentPlan,
  canUpgrade,
  loading,
  onPlanSelect,
  formatPrice,
}) {
  return (
    <div className="px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const tier = getPlanTier(plan);
          const isPopular = !!plan.isPopular;
          const isCurrent = isCurrentPlan(plan._id, plan);
          const canUpgradeToThis = canUpgrade(plan);

          return (
            <PlanCard
              key={plan._id}
              plan={plan}
              tier={tier}
              icon={getPlanIcon(tier)}
              isPopular={isPopular}
              isCurrent={isCurrent}
              canUpgradeToThis={canUpgradeToThis}
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
