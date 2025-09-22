import { Button } from "@/components/ui/button";
import ImageOptimized from "@/components/ImageOptimized";
import { writeClient } from "@/sanity/lib/serverClient";
import { COMPANIES_IMAGES } from "@/sanity/queries/companies";

export default async function Discover() {
  const companies = await writeClient.fetch(COMPANIES_IMAGES);

  return (
    <section className="w-full py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {(companies && companies.length > 0 ? companies : []).map((c) => (
              <div
                key={c.id}
                className="group aspect-[4/3] sm:aspect-[2/1] rounded-xl overflow-hidden bg-muted ring-1 ring-border/50 flex items-center justify-center"
              >
                <ImageOptimized
                  sanityImage={c.logo}
                  companyName={c.name}
                  alt={`${c.name} company logo on OrbsAI`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  width={800}
                  height={600}
                  loading="lazy"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  context="company showcase"
                />
              </div>
            ))}
            {(!companies || companies.length === 0) && (
              <div className="col-span-2 sm:col-span-3 aspect-[4/3] sm:aspect-[2/1] rounded-xl overflow-hidden bg-muted ring-1 ring-border/50 flex items-center justify-center text-muted-foreground text-sm">
                لا توجد صور شركات متاحة بعد.
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-3 sm:gap-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight will-change-auto">
            اكتشف أفضل شركات الفعاليات لكل مناسبة
          </h2>
          <p className="text-muted-foreground max-w-xl will-change-auto">
            من منسقي الزهور إلى المصممين المبدعين — استكشف شركات موثوقة جاهزة
            لجعل مناسبتك لا تُنسى.
          </p>
          <Button size="lg" className="w-full sm:w-auto">
            تصفح الشركات
          </Button>
        </div>
      </div>
    </section>
  );
}
