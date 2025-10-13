import { writeClient } from "@/sanity/lib/serverClient";
import { COMPANY_SLUGS_QUERY } from "@/sanity/queries/company";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries/categories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const urls = [];

  // Static routes
  const staticRoutes = ["/", "/companies"];
  for (const path of staticRoutes) {
    urls.push({
      url: `${siteUrl}${path}`,
      changeFrequency: "weekly",
      priority: path === "/" ? 1.0 : 0.7,
      lastModified: new Date(),
    });
  }

  // Dynamic company detail routes
  let companySlugs = [];
  try {
    companySlugs = await writeClient.fetch(COMPANY_SLUGS_QUERY);
  } catch (e) {
    companySlugs = [];
  }
  for (const slug of companySlugs || []) {
    urls.push({
      url: `${siteUrl}/companies/${slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
      lastModified: new Date(),
    });
  }

  // Category-based company listing pages
  let categories = [];
  try {
    const categoriesRes = await writeClient.fetch(ALL_CATEGORIES_QUERY);
    categories = Array.isArray(categoriesRes)
      ? categoriesRes
      : (categoriesRes?.data ?? []);
  } catch (e) {
    categories = [];
  }
  for (const category of categories || []) {
    if (category.slug) {
      urls.push({
        url: `${siteUrl}/companies?spec=${category.slug}`,
        changeFrequency: "weekly",
        priority: 0.5,
        lastModified: new Date(),
      });
    }
  }

  // Company type pages
  const companyTypes = ["online-store", "dates-shop", "distributor"];
  for (const type of companyTypes) {
    urls.push({
      url: `${siteUrl}/companies?ctype=${type}`,
      changeFrequency: "weekly",
      priority: 0.4,
      lastModified: new Date(),
    });
  }

  return urls;
}
