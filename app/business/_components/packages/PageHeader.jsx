"use client";

import BillingToggle from "./BillingToggle";

export default function PageHeader({
  tenantType,
  billingInterval,
  onBillingChange,
  annualSavings,
}) {
  return (
    <div className="text-center space-y-4 sm:space-y-6 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
        اختر باقتك
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
        طور {tenantType === "company" ? "شركتك" : "عملك"} بالباقة المثالية. يمكنك الترقية أو التراجع في أي وقت.
      </p>

      {/* Billing Toggle */}
      <div className="flex justify-center pt-2">
        <BillingToggle
          value={billingInterval}
          onChange={onBillingChange}
          annualSavings={annualSavings}
        />
      </div>
    </div>
  );
}
