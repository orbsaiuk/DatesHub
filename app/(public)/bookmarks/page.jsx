import DirectoryList from "@/components/directory/_components/DirectoryList";
import { writeClient } from "@/sanity/lib/serverClient";
import { auth } from "@clerk/nextjs/server";
import { USER_BOOKMARKS_QUERY } from "@/sanity/queries/user";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";
import { urlFor } from "@/sanity/lib/image";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Bookmarks - Saved Companies | OrbsAI",
  description:
    "Access your saved companies. Manage your bookmarked businesses, review their profiles, and easily reconnect with your preferred business partners on OrbsAI.",
  keywords: [
    "bookmarks",
    "saved companies",
    "favorite businesses",
    "business favorites",
  ],
  robots: { index: false, follow: false },
};

export default async function BookmarksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [data, settings] = await Promise.all([
    writeClient.fetch(USER_BOOKMARKS_QUERY, { uid: userId }),
    writeClient.fetch(SITE_SETTINGS_QUERY),
  ]);
  const logoUrl = settings?.logo
    ? urlFor(settings.logo).width(120).height(32).url()
    : undefined;
  const brandTitle = settings?.title || "Brand";
  const companies = Array.isArray(data?.bookmarks)
    ? data.bookmarks.filter(Boolean)
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header brandTitle={brandTitle} logoUrl={logoUrl} />
      <BreadcrumbNavigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <h1 className="text-2xl font-semibold mb-4">Bookmarks</h1>
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
          ) : (
            <DirectoryList
              items={companies}
              basePath="/companies"
              clearHref="/companies"
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
