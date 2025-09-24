import DirectoryHero from "./_components/DirectoryHero";
import DirectoryHeader from "./_components/DirectoryHeader";
import DirectoryList from "./_components/DirectoryList";

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
  const companies = Array.isArray(result) ? result : (result?.data ?? []);

  const categoriesRes = await writeClient.fetch(
    ALL_CATEGORIES_BY_TENANT_QUERY,
    PUBLIC_TENANT
  );
  const categories = Array.isArray(categoriesRes)
    ? categoriesRes
    : (categoriesRes?.data ?? []);

  const cityRegionRes = await writeClient.fetch(
    type === "suppliers"
      ? SUPPLIER_CITY_REGION_QUERY
      : COMPANY_CITY_REGION_QUERY
  );
  const cities = Array.isArray(cityRegionRes)
    ? cityRegionRes
    : (cityRegionRes?.data ?? []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <DirectoryHero
          title={`اعثر على ${title.toLowerCase()} المثالية`}
          subtitle="لخدمة فعاليتك"
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
          count={companies.length}
          cities={cities}
        />
        <DirectoryList
          items={companies}
          clearHref={basePath}
          basePath={basePath}
        />
      </main>
    </div>
  );
}
