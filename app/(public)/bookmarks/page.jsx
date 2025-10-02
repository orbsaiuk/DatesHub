import DirectoryList from "@/components/directory/_components/DirectoryList";
import { writeClient } from "@/sanity/lib/serverClient";
import { auth } from "@clerk/nextjs/server";
import { USER_BOOKMARKS_QUERY } from "@/sanity/queries/user";
import { redirect } from "next/navigation";
import HeaderClient from "@/components/HeaderClient";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "المحفوظات - الشركات المحفوظة | OrbsAI",
  description:
    "الوصول إلى الشركات المحفوظة. إدارة الشركات المفضلة، مراجعة ملفاتها الشخصية، وإعادة الاتصال بشركاء الأعمال المفضلين بسهولة على OrbsAI.",
  keywords: ["المحفوظات", "الشركات المحفوظة", "الشركات المفضلة", "شركات مفضلة"],
  robots: { index: false, follow: false },
};

export default async function BookmarksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await writeClient.fetch(USER_BOOKMARKS_QUERY, { uid: userId });

  const companies = Array.isArray(data?.bookmarks)
    ? data.bookmarks.filter(Boolean)
    : [];

  // All items on this page are bookmarked, so extract their IDs
  const bookmarkedIds = companies
    .map((c) => c?.id || c?.tenantId)
    .filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderClient />
      <BreadcrumbNavigation />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <h1 className="text-2xl font-semibold mb-4">المحفوظات</h1>
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا توجد محفوظات بعد.
            </p>
          ) : (
            <DirectoryList
              items={companies}
              basePath="/companies"
              clearHref="/companies"
              initialBookmarkedIds={bookmarkedIds}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
