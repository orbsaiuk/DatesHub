"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const faqItems = [
  {
    question: "Can I change my plan anytime?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    question: "What happens to my data if I downgrade?",
    answer:
      "Your data is safe. However, you may lose access to premium features and have reduced limits.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes, all accounts start with our Free plan. You can upgrade to unlock more features.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
];

export default function FAQSection() {
  return (
    <Card className="mx-4 sm:mx-6">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Info className="w-5 h-5" />
          <span>Frequently Asked Questions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="pb-4 border-b border-border last:border-b-0 last:pb-0"
          >
            <h4 className="font-medium mb-2 text-base leading-tight">
              {item.question}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
