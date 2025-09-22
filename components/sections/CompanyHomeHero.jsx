import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";

export const revalidate = 60;

export default async function CompanyHomeHero() {
  const settings = await sanityFetch({ query: SITE_SETTINGS_QUERY });
  return (
    <section className="w-full bg-muted py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight md:leading-[1.15] will-change-auto">
            {settings?.companyHeroTitle ||
              "اعثر على الموردين المناسبين لاحتياجات عملك"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {settings?.companyHeroDescription ||
              "تواصل مع موردين موثوقين، قارن العروض، ونمِّ أعمالك"}
          </p>
          <div>
            <a
              href="/companies"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-1 ring-primary hover:opacity-90"
              aria-label="تصفح الموردين"
            >
              تصفح الموردين
            </a>
          </div>
        </div>
        <div className="w-full h-64 sm:h-80 lg:h-96 rounded-xl bg-accent/30 ring-1 ring-border" />
      </div>
    </section>
  );
}
