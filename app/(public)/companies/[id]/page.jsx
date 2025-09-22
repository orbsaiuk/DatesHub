import CompanyHeader from "./_components/CompanyHeader";
import CompanyOverview from "./_components/CompanyOverview";
import CompanyAccordions from "./_components/CompanyAccordions";
import { writeClient } from "@/sanity/lib/serverClient";
import { COMPANY_DETAIL_QUERY } from "@/sanity/queries/companies";
import { COMPANY_BY_ID_OR_SLUG_QUERY } from "@/sanity/queries/company";
import { notFound } from "next/navigation";
import CompanyMap from "./_components/CompanyMap";
import ScrollToTop from "@/components/ScrollToTop";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await writeClient.fetch(COMPANY_DETAIL_QUERY);
    if (!Array.isArray(slugs)) {
      return [];
    }
    return slugs.map((slug) => ({ id: slug }));
  } catch (error) {
    console.error("Error fetching company slugs:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await writeClient.fetch(COMPANY_BY_ID_OR_SLUG_QUERY, { id });
  if (!data) return {};

  const name = data.name || "Company";
  const plain = (data.descriptionText || "").trim();
  const description = plain
    ? plain.length > 160
      ? plain.slice(0, 157) + "..."
      : plain
    : `Discover ${name}'s services, details, and contact information.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/companies/${data.slug?.current || id}`;

  // Generate dynamic keywords based on company data
  const baseKeywords = [name, "company", "business", "categories"];

  // Add location-based keywords
  if (data.locations?.length > 0) {
    const location = data.locations[0];
    if (location.city)
      baseKeywords.push(location.city, `${name} ${location.city}`);
    if (location.region)
      baseKeywords.push(location.region, `${name} ${location.region}`);
    if (location.country) baseKeywords.push(location.country);
  }

  // Add category keywords
  if (data.categories?.length > 0) {
    data.categories.forEach((cat) => {
      if (cat.title) baseKeywords.push(cat.title, `${name} ${cat.title}`);
    });
  }

  // Add company type keywords
  if (data.companyType) {
    baseKeywords.push(data.companyType.replace("-", " "));
  }

  // Add service-related keywords
  if (data.extraServices?.length > 0) {
    data.extraServices.forEach((service) => {
      if (service) baseKeywords.push(service);
    });
  }

  const keywords = [...new Set(baseKeywords)].slice(0, 15); // Limit to 15 unique keywords

  return {
    title: name,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: name,
      description,
      url,
      type: "profile",
      siteName: "OrbsAI",
      images: data.logo
        ? [
            {
              url: data.logo?.asset?.url || "/next.svg",
              alt: `${name} logo - Business profile on OrbsAI`,
              width: data.logo?.asset?.metadata?.dimensions?.width || 400,
              height: data.logo?.asset?.metadata?.dimensions?.height || 400,
            },
          ]
        : [
            {
              url: "/next.svg",
              alt: `${name} - Business profile on OrbsAI`,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: data.logo
        ? [
            {
              url: data.logo?.asset?.url || "/next.svg",
              alt: `${name} logo`,
            },
          ]
        : [
            {
              url: "/next.svg",
              alt: `${name} business profile`,
            },
          ],
    },
  };
}

export default async function CompanyDetailsPage({ params }) {
  const { id } = await params;
  const result = await writeClient.fetch(COMPANY_BY_ID_OR_SLUG_QUERY, {
    id,
  });
  const data = result?.data ?? result;
  if (!data) return notFound();

  function buildLocationString(loc) {
    if (!loc || typeof loc !== "object") return "";
    const rawParts = [loc.address, loc.city, loc.region, loc.country].filter(
      Boolean
    );
    const seen = new Set();
    const parts = [];
    for (const part of rawParts) {
      const key = String(part).trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      parts.push(String(part).trim());
    }
    return parts.join(", ");
  }

  const primaryLocation =
    Array.isArray(data?.locations) && data.locations.length > 0
      ? data.locations[0]
      : null;
  const locationStrings = Array.isArray(data?.locations)
    ? Array.from(
        new Set(
          data.locations.map((loc) => buildLocationString(loc)).filter(Boolean)
        )
      )
    : [];

  const company = {
    id: data?.tenantId || id,
    name: data.name,
    rating: data.rating || 0,
    ratingCount: data.ratingCount || 0,
    verifiedLabel: data.verifiedLabel,
    logo: data.logo,
    location: locationStrings[0] || data.locationString || "",
    locationList: locationStrings,
    locations: Array.isArray(data?.locations) ? data.locations : [],
    openingHours: data.openingHours,
    description: data.descriptionText || "",
    website: data.website || "",
    extraServices: data?.extraServices || [],
    geo: primaryLocation?.geo || null,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pageUrl = `${siteUrl}/companies/${data.slug?.current || id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: pageUrl,
    description: company.description || undefined,
    telephone: data?.contact?.phone || undefined,
    email: data?.contact?.email || undefined,
    address: company.location || undefined,
    sameAs:
      Array.isArray(data?.socialLinks) && data.socialLinks.length
        ? data.socialLinks
        : undefined,
  };

  return (
    <div className="container mx-auto px-4 my-6 sm:my-8">
      <ScrollToTop />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <CompanyHeader company={company} />

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden">
            <CompanyMap company={company} />
          </div>
        </div>
      </div>

      <CompanyOverview company={company} />

      <CompanyAccordions
        reviews={data.reviews || []}
        works={data.ourWorks || []}
        awards={data.awards || []}
        company={company}
      />
    </div>
  );
}
