import HeroSearch from "./HeroSearch";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";
import { sanityFetch } from "@/sanity/lib/live";

export const revalidate = 60;

export default async function Hero() {
  const settings = await sanityFetch({ query: SITE_SETTINGS_QUERY });

  return (
    <section className="w-full bg-gray-100 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight md:leading-[1.15]">
          {settings?.data?.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-4">
          {settings?.data?.heroDescription}
        </p>
        <HeroSearch />
      </div>
    </section>
  );
}
