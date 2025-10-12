import { PartyPopper, ShieldCheck, Headset } from "lucide-react";

const fixedIcons = [PartyPopper, ShieldCheck, Headset];

export default function Why({ items }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 sm:py-16 bg-section-title/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-4xl tracking-tight text-section-title mb-6 sm:mb-10">
          لماذا تختارنا؟
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {items.map((feature, idx) => {
            const Icon = fixedIcons[idx % fixedIcons.length];
            return (
              <article
                key={feature.title}
                className="group relative flex flex-col items-center text-center rounded-2xl border bg-white/70 dark:bg-gray-900/60 backdrop-blur p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 dark:border-gray-800"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border shadow-sm ring-1 ring-black/5 bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900 flex items-center justify-center mb-4 sm:mb-6">
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>

                <div className="flex flex-col gap-2 max-w-xs">
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-section-title">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
