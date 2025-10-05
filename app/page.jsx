import HeaderClient from "@/components/HeaderClient";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Discover from "@/components/sections/Discover";
import FeaturedCompanies from "@/components/sections/FeaturedCompanies";
import How from "@/components/sections/How";
import Why from "@/components/sections/Why";
import FAQ from "@/components/sections/FAQ";
import Blog from "@/components/sections/Blog";
import PromotionalBannersSection from "@/components/sections/PromotionalBannersSection";
import Categories from "@/components/sections/Categories";
import CompanyHomeHero from "@/components/sections/CompanyHomeHero";
import JoinSection from "@/components/sections/JoinSection";
import UserHomePageSkeleton from "@/components/sections/UserHomePageSkeleton";
import { SignedOut } from "@clerk/nextjs";
import { RoleBasedLayout } from "@/components/ClientRoleDetector";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";
import { getRecentBlogs } from "@/services/sanity/blogs";
import { getActivePromotionalBanners } from "@/services/sanity/promotionalBanners";

export const metadata = {
  title: "OrbsAI — اكتشف الشركات والموردين",
  description:
    "اكتشف وتواصل مع الشركات والموردين المعتمدين حول العالم. استكشف فئات الأعمال والعروض الحصرية وملفات الشركات التفصيلية. انضم إلى شبكتنا الموثوقة اليوم.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  // Fetch data server-side for all components
  const [settings, recentBlogs, companyBanners, userBanners] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    getRecentBlogs(3),
    getActivePromotionalBanners("suppliers,all"),
    getActivePromotionalBanners("companies,all"),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderClient />
      <main className="flex-1">
        <RoleBasedLayout
          // Global loading skeleton for all roles
          loadingFallback={<UserHomePageSkeleton />}
          // Company view
          companyContent={
            <>
              <CompanyHomeHero />
              <PromotionalBannersSection banners={companyBanners} />
              <Categories />
            </>
          }
          // Regular user view (default)
          userContent={
            <>
              <Hero />
              <Discover />
              <PromotionalBannersSection banners={userBanners} />
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
          }
        />
      </main>
      <Footer />
    </div>
  );
}
