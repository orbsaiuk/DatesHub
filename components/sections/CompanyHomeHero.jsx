import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";
import { Button } from "../ui/button";
import Link from "next/link";

export const revalidate = 60;

export default async function CompanyHomeHero() {
  const settings = await sanityFetch({ query: SITE_SETTINGS_QUERY });

  return (
    <section className="w-full bg-muted py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight will-change-auto">
            {settings?.data?.companyHeroTitle}
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground">
            {settings?.data?.companyHeroDescription}
          </p>
          <Link href="/suppliers">
            <Button
              variant="default"
              size="lg"
              className="inline-flex items-center justify-center rounded-md bg-button-1 hover:bg-button-1-hover text-white cursor-pointer"
              aria-label="تصفح الموردين"
            >
              تصفح الموردين
            </Button>
          </Link>
        </div>
        <div className="w-full h-64 sm:h-80 lg:h-96 rounded-xl bg-accent/30 ring-1 ring-border" />
      </div>
    </section>
  );
}
