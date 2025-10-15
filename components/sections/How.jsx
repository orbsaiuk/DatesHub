import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
export default function How({ items }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section id="how" className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-4xl tracking-tight text-center mb-6 sm:mb-10">
          كيف تعمل المنصة؟
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {items.map((step, idx) => {
            const iconUrl = step.icon?.asset?.url;
            return (
              <Card
                key={idx}
                className="h-full bg-transparent border-none shadow-none"
              >
                <CardHeader className="flex flex-col items-center gap-2 text-center">
                  <Image
                    src={iconUrl}
                    alt={`${step.title} icon`}
                    width={80}
                    height={80}
                    className="object-contain"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(48%) sepia(8%) saturate(1350%) hue-rotate(90deg) brightness(95%) contrast(90%)",
                    }}
                  />
                  <CardTitle className="text-lg sm:text-xl text-section-title">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
