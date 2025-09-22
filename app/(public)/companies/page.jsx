import Hero from "./_components/Hero";
import Header from "./_components/Header";
import CompanyList from "./_components/CompanyList";

import { writeClient } from "@/sanity/lib/serverClient";
import {
  COMPANIES_LIST_QUERY,
  buildCompaniesQuery,
  COMPANY_CITY_REGION_QUERY,
} from "@/sanity/queries/companies";
import { ALL_CATEGORIES_BY_TENANT_QUERY } from "@/sanity/queries/categories";
import { PUBLIC_TENANT } from "@/sanity/lib/tenancy";
import { generateCompaniesMetadata } from "./generateMetadata";

export async function generateMetadata({ searchParams }) {
  return await generateCompaniesMetadata(await searchParams);
}

export default async function Companies({ searchParams }) {
  const { loc, spec, ctype, sort, q } = (await searchParams) || {};

  const hasFilters = Boolean(loc || spec || ctype || sort || q);
  const { query, params } = hasFilters
    ? buildCompaniesQuery({
        location: loc || undefined,
        specialization: spec || undefined,
        companyType: ctype && ctype !== "all" ? ctype : undefined,
        search: q || undefined,
      })
    : { query: COMPANIES_LIST_QUERY, params: {} };

  const result = await writeClient.fetch(query, params);
  const companies = Array.isArray(result) ? result : (result?.data ?? []);

  const categoriesRes = await writeClient.fetch(
    ALL_CATEGORIES_BY_TENANT_QUERY,
    PUBLIC_TENANT
  );
  const categories = Array.isArray(categoriesRes)
    ? categoriesRes
    : (categoriesRes?.data ?? []);

  const cityRegionRes = await writeClient.fetch(COMPANY_CITY_REGION_QUERY);
  const cities = Array.isArray(cityRegionRes)
    ? cityRegionRes
    : (cityRegionRes?.data ?? []);

  return (
    <div>
      <Hero />
      <Header
        categories={categories}
        initialFilters={{
          loc: loc || "",
          spec: spec || "",
          ctype: ctype || "all",
          sort: sort || "verified",
          q: q || "",
        }}
        count={companies.length}
        cities={cities}
      />
      <CompanyList companies={companies} />
    </div>
  );
}
