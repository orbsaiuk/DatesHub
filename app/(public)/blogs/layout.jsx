import { writeClient } from "@/sanity/lib/serverClient";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";
import { urlFor } from "@/sanity/lib/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export default async function BlogLayout({ children }) {
  const settings = await writeClient.fetch(SITE_SETTINGS_QUERY);
  const brandTitle = settings?.title || undefined;
  const logoUrl = settings?.logo
    ? urlFor(settings.logo).width(120).height(32).url()
    : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header brandTitle={brandTitle} logoUrl={logoUrl} />
      <div className="px-4 sm:px-6 lg:px-8">
        <BreadcrumbNavigation />
      </div>
      <div className="flex-1">
        {children}
      </div>
      <Footer
        settings={{
          title: settings?.title,
          description: settings?.description,
          footerText: settings?.footerText,
          socialLinks: settings?.socialLinks,
        }}
      />
    </div>
  );
}
