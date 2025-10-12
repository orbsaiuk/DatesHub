import DirectoryHero from "./_components/DirectoryHero";
import DirectoryHeader from "./_components/DirectoryHeader";
import DirectoryList from "./_components/DirectoryList";

import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/serverClient";
import {
  COMPANIES_LIST_QUERY,
  buildCompaniesQuery,
  COMPANY_CITY_REGION_QUERY,
} from "@/sanity/queries/companies";
import {
  SUPPLIERS_LIST_QUERY,
  buildSuppliersQuery,
  SUPPLIER_CITY_REGION_QUERY,
} from "@/sanity/queries/suppliers";
import { ALL_CATEGORIES_BY_TENANT_QUERY } from "@/sanity/queries/categories";
import { PUBLIC_TENANT } from "@/sanity/lib/tenancy";
import { auth } from "@clerk/nextjs/server";
import { USER_BOOKMARK_IDS_QUERY } from "@/sanity/queries/user";

export default async function DirectoryPage({
  type = "companies",
  searchParams,
}) {
  const title = type === "suppliers" ? "الموردين" : "الشركات";
  const basePath = type === "suppliers" ? "/suppliers" : "/companies";

  const { loc, spec, ctype, sort, q } = (await searchParams) || {};
  const hasFilters = Boolean(loc || spec || ctype || sort || q);
  const { query, params } = hasFilters
    ? type === "suppliers"
      ? buildSuppliersQuery({
          location: loc || undefined,
          specialization: spec || undefined,
          search: q || undefined,
        })
      : buildCompaniesQuery({
          location: loc || undefined,
          specialization: spec || undefined,
          companyType: ctype && ctype !== "all" ? ctype : undefined,
          search: q || undefined,
        })
    : {
        query:
          type === "suppliers" ? SUPPLIERS_LIST_QUERY : COMPANIES_LIST_QUERY,
        params: {},
      };

  const result = await writeClient.fetch(query, params);
  const tenants = Array.isArray(result) ? result : (result?.data ?? []);

  const categoriesRes = await client.fetch(
    ALL_CATEGORIES_BY_TENANT_QUERY,
    PUBLIC_TENANT
  );
  const categories = Array.isArray(categoriesRes)
    ? categoriesRes
    : (categoriesRes?.data ?? []);

  const cityRegionRes = await client.fetch(
    type === "suppliers"
      ? SUPPLIER_CITY_REGION_QUERY
      : COMPANY_CITY_REGION_QUERY
  );
  const cities = Array.isArray(cityRegionRes)
    ? cityRegionRes
    : (cityRegionRes?.data ?? []);

  // Fetch user's bookmarks on the server to avoid client-side delay
  let bookmarkedIds = [];
  try {
    const { userId } = await auth();
    if (userId) {
      const bookmarksRes = await writeClient.fetch(USER_BOOKMARK_IDS_QUERY, {
        uid: userId,
      });
      bookmarkedIds = Array.isArray(bookmarksRes?.bookmarks)
        ? bookmarksRes.bookmarks.map((b) => b?.id).filter(Boolean)
        : [];
    }
  } catch (_) {
    // User not logged in or error fetching bookmarks - continue with empty array
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <DirectoryHero
          title={
            title === "الشركات"
              ? `ابحث عن الشركة المثالية لاحتياجاتك`
              : `ابحث عن الخدمة المثالية لاحتياجاتك في عالم التمور`
          }
          subtitle={
            title === "الشركات"
              ? `تصفح وتواصل مع أفضل الشركات المتخصصة في إنتاج، تغليف، وتصدير التمور الفاخرة. `
              : `تصفح وتواصل مع أفضل الموردين المتخصصة في إنتاج، تغليف، وتصدير التمور الفاخرة. `
          }
        />
        <DirectoryHeader
          title={`جميع ${title}`}
          basePath={basePath}
          categories={categories}
          initialFilters={{
            loc: loc || "",
            spec: spec || "",
            ctype: ctype || "all",
            q: q || "",
          }}
          count={tenants.length}
          cities={cities}
        />
        <DirectoryList
          items={tenants}
          clearHref={basePath}
          basePath={basePath}
          initialBookmarkedIds={bookmarkedIds}
        />
      </main>
    </div>
  );
}
