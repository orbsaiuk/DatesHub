import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Search, Send, PartyPopper } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DoorOpen } from "lucide-react";
import { SignedOut } from "@clerk/nextjs";

const fixedIcons = [Search, Send, PartyPopper];

const defaultSteps = [
  {
    title: "الخطوة 1: تصفح الشركات",
    description:
      "اكتشف مزودي الخدمات للزهور والبالونات والتصوير والقاعات والمزيد.",
  },
  {
    title: "الخطوة 2: أرسل طلبك",
    description: "راسل عدة شركات دفعة واحدة بتفاصيل مناسبتك.",
  },
  {
    title: "الخطوة 3: حضّر مناسبتك",
    description: "أكد اختياراتك وتابع كل شيء من هاتفك.",
  },
];

export default function How({ items }) {
  const baseSteps =
    Array.isArray(items) && items.length > 0 ? items : defaultSteps;
  let steps = baseSteps.slice(0, 3);
  if (steps.length < 3) {
    steps = steps.concat(defaultSteps.slice(steps.length, 3));
  }

  return (
    <section id="how" className="w-full py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-4xl font-semibold tracking-tight">
          كيف تعمل المنصة
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
          {steps.map((step, idx) => {
            const Icon = fixedIcons[idx % fixedIcons.length];
            return (
              <Card
                key={idx}
                className="h-full transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
        <SignedOut>
          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild aria-label="ابدأ الآن">
              <Link href="/sign-up">
                <DoorOpen className="w-4 h-4 ml-2" /> ابدأ الآن
              </Link>
            </Button>
          </div>
        </SignedOut>
      </div>
    </section>
  );
}
