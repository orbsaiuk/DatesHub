import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";
import { writeClient } from "@/sanity/lib/serverClient";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";

export default async function MessagesLayout({ children }) {
  // Fetch site settings for header branding
  let brandTitle = "Brand";
  let logoUrl = null;
  try {
    const siteSettings = await writeClient.fetch(SITE_SETTINGS_QUERY);
    brandTitle = siteSettings?.brandTitle || brandTitle;
    logoUrl = siteSettings?.logo ? siteSettings.logo : null;
  } catch (_) {
    // best-effort; keep defaults
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header brandTitle={brandTitle} logoUrl={logoUrl} />
      <BreadcrumbNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
