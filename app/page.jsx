import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamicImport from "next/dynamic";
import Hero from "@/components/sections/Hero";
import JoinSection from "@/components/sections/JoinSection";
const FeaturedCompanies = dynamicImport(
  () => import("@/components/sections/FeaturedCompanies"),
  { ssr: true }
);
const FAQ = dynamicImport(() => import("@/components/sections/FAQ"), {
  ssr: true,
});
const Blog = dynamicImport(() => import("@/components/sections/Blog"), {
  ssr: true,
  loading: () => {
    const BlogSkeleton = require("@/components/sections/BlogSkeleton").default;
    return <BlogSkeleton count={3} />;
  },
});
const Discover = dynamicImport(() => import("@/components/sections/Discover"), {
  ssr: true,
});
const Categories = dynamicImport(
  () => import("@/components/sections/Categories"),
  {
    ssr: true,
  }
);
const How = dynamicImport(() => import("@/components/sections/How"), {
  ssr: true,
});
const Why = dynamicImport(() => import("@/components/sections/Why"), {
  ssr: true,
});
const OffersSection = dynamicImport(
  () => import("@/components/sections/OffersSection"),
  { ssr: true }
);
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";
import CompanyHomeHero from "@/components/sections/CompanyHomeHero";
import { SignedOut } from "@clerk/nextjs";
import { getRecentBlogs } from "@/services/sanity/blogs";
import { getAuthenticatedUser } from "@/lib/auth/authorization";

// Force dynamic rendering to ensure auth state is always fresh
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const user = await getAuthenticatedUser();
  const role = user?.role || null;
  const isCompany = role === "company";
  if (isCompany) {
    return {
      title: "OrbsAI — اكتشف الموردين",
      description:
        "اكتشف وتواصل مع الموردين. تصفح الفئات، شاهد العروض الحصرية، واستكشف ملفات الأعمال التفصيلية على OrbsAI.",
      alternates: { canonical: "/" },
    };
  }
  return {
    title: "OrbsAI — اكتشف الشركات",
    description:
      "اكتشف وتواصل مع الشركات. تصفح الفئات، شاهد العروض الحصرية، واستكشف ملفات الأعمال التفصيلية على OrbsAI.",
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const settings = await client.fetch(SITE_SETTINGS_QUERY);
  // Get user with role fallback - checks sessionClaims first, then Clerk API if needed
  const user = await getAuthenticatedUser();
  const role = user?.role || null;
  const isCompany = role === "company";

  const recentBlogs = await getRecentBlogs(3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {isCompany ? (
          <>
            <CompanyHomeHero />
            <OffersSection type="supplier" />
            <Categories />
          </>
        ) : (
          <>
            <Hero />
            <Discover />
            <OffersSection type="company" />
            <Categories />
            <FeaturedCompanies />
            <How items={settings?.how} />
            <Why items={settings?.why} />
            <SignedOut>
              <JoinSection />
            </SignedOut>
            <Blog items={recentBlogs} title="نصائح لتخطيط الفعاليات" />
            <FAQ items={settings?.faq} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
