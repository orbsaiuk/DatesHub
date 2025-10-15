import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";

export default function Why({ items }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 sm:py-16 bg-section-title/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-4xl tracking-tight mb-6 sm:mb-10">
          لماذا تختارنا؟
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {items.map((feature, idx) => {
            const iconUrl = feature.icon?.asset?.url;
            return (
              <Card key={idx} className="h-full">
                <CardHeader className="flex flex-col items-start gap-2">
                  <Image
                    src={iconUrl}
                    alt={`${feature.title} icon`}
                    width={80}
                    height={80}
                    className="object-contain"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(48%) sepia(8%) saturate(1350%) hue-rotate(90deg) brightness(95%) contrast(90%)",
                    }}
                  />
                  <CardTitle className="text-lg sm:text-xl text-section-title">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {feature.description}
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
