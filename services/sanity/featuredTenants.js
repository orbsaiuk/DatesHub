import { writeClient } from "@/sanity/lib/serverClient";
import { COMPANY_CARD_PROJECTION } from "@/sanity/queries/companies";
import { SUPPLIER_CARD_PROJECTION } from "@/sanity/queries/suppliers";

// Query for featured companies (sorted by rating desc, then by ratingCount desc)
export const FEATURED_COMPANIES_QUERY = `
*[_type == "company"] | order(coalesce(rating, 0) desc, ratingCount desc)[0...3] ${COMPANY_CARD_PROJECTION}
`;

// Query for featured suppliers (sorted by rating desc, then by ratingCount desc)
export const FEATURED_SUPPLIERS_QUERY = `
*[_type == "supplier"] | order(coalesce(rating, 0) desc, ratingCount desc)[0...3] ${SUPPLIER_CARD_PROJECTION}
`;

export async function getFeaturedTenants(type = "companies", limit = 8) {
  try {
    const query =
      type === "companies"
        ? FEATURED_COMPANIES_QUERY
        : FEATURED_SUPPLIERS_QUERY;
    const modifiedQuery = query.replace("[0...3]", `[0...${limit}]`);

    const tenants = await writeClient.fetch(modifiedQuery);
    return tenants || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
