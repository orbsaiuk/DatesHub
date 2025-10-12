import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    <section id="how" className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-4xl tracking-tight text-section-title text-center mb-6 sm:mb-10">
          كيف تعمل المنصة؟
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {steps.map((step, idx) => {
            return (
              <Card
                key={idx}
                className="h-full transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <div>
                    <CardTitle className="text-lg text-section-title">
                      {step.title}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
