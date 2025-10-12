import HeroSearch from "./HeroSearch";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";
import { sanityFetch } from "@/sanity/lib/live";
import Image from "next/image";

export const revalidate = 60;

export default async function Hero() {
  const settings = await sanityFetch({ query: SITE_SETTINGS_QUERY });

  return (
    <section
      className="w-full py-12 sm:py-16 lg:py-24 h-[60vh] relative overflow-hidden"
      data-aos="fade"
      data-aos-duration="800"
    >
      {/* Optimized background image */}
      <Image
        src="/Hero-home.jpg"
        alt="Hero background"
        fill
        priority
        quality={90}
        className="object-cover object-left sm:object-center"
        sizes="100vw"
      />

      {/* Mobile overlay */}
      <div className="absolute inset-0 bg-black/40 block sm:hidden"></div>

      {/* Content */}
      <div
        className="container mx-auto px-4 sm:px-0 flex flex-col items-center sm:items-start text-center sm:text-right relative z-10 h-full justify-center"
        data-aos="fade-left"
        data-aos-duration="600"
        data-aos-delay="200"
      >
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight w-full sm:w-1/2 text-white sm:text-black">
          {settings?.data?.heroTitle}
        </h1>
        <p className="text-sm sm:text-lg mt-4 text-white sm:text-black">
          {settings?.data?.heroDescription}
        </p>
        <HeroSearch />
      </div>
    </section>
  );
}
