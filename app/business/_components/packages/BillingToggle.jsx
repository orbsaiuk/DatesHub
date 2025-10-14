"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function BillingToggle({ value, onChange, annualSavings }) {
  console.log("annualSavings", annualSavings);
  return (
    <div className="flex items-center justify-center w-full">
      <Tabs value={value} onValueChange={onChange} className="w-fit max-w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger
            value="year"
            className="relative cursor-pointer px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-base flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
          >
            {annualSavings && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
              >
                %وفر {annualSavings}
              </Badge>
            )}
            <span>سنوياً</span>
          </TabsTrigger>
          <TabsTrigger
            value="month"
            className="cursor-pointer px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
          >
            شهرياً
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
