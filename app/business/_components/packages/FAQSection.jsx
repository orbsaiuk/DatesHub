"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const faqItems = [
  {
    question: "هل يمكنني تغيير باقتي في أي وقت؟",
    answer:
      "نعم، يمكنك الترقية أو التراجع في باقتك في أي وقت. تسري التغييرات فوراً.",
  },
  {
    question: "ماذا يحدث لبياناتي إذا تراجعت في الباقة؟",
    answer:
      "بياناتك آمنة. ولكن قد تفقد الوصول إلى الميزات المتقدمة وتقل الحدود.",
  },
  {
    question: "هل توجد فترة تجريبية مجانية؟",
    answer:
      "نعم، جميع الحسابات تبدأ بباقتنا المجانية. يمكنك الترقية لفتح ميزات أكثر.",
  },
  {
    question: "هل تقدمون استرداد الأموال؟",
    answer:
      "نقدم ضمان استرداد الأموال لمدة 30 يوماً لجميع الباقات المدفوعة. تواصل مع الدعم للمساعدة.",
  },
  {
    question: "هل يمكنني إلغاء اشتراكي؟",
    answer:
      "نعم، يمكنك إلغاء اشتراكك في أي وقت. ستستمر في الوصول حتى نهاية فترة الفواتير.",
  },
];

export default function FAQSection() {
  return (
    <Card className="mx-4 sm:mx-6">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Info className="w-5 h-5" />
          <span>الأسئلة الشائعة</span>
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
