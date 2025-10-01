import DirectoryHeader from "./_components/DirectoryHeader";
import DirectoryOverview from "./_components/DirectoryOverview";
import DirectoryAccordions from "./_components/DirectoryAccordions";
import DirectoryMap from "./_components/DirectoryMap";
import ScrollToTop from "@/components/ScrollToTop";
import BreadcrumbPrefetch from "@/components/navigation/BreadcrumbPrefetch";
import { writeClient } from "@/sanity/lib/serverClient";
import { COMPANY_DETAIL_QUERY } from "@/sanity/queries/companies";
import { COMPANY_BY_ID_OR_SLUG_QUERY } from "@/sanity/queries/company";
import { SUPPLIER_BY_ID_OR_SLUG_QUERY } from "@/sanity/queries/supplier";
import { SUPPLIER_DETAIL_QUERY } from "@/sanity/queries/suppliers";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { USER_BOOKMARK_IDS_QUERY } from "@/sanity/queries/user";
import { getCompanyInteractionStatus } from "@/services/interactionStatus";

export const revalidate = 60;

export async function generateDetailStaticParams({ type = "company" } = {}) {
  try {
    const slugs = await writeClient.fetch(
      type === "supplier" ? SUPPLIER_DETAIL_QUERY : COMPANY_DETAIL_QUERY
    );
    if (!Array.isArray(slugs)) return [];
    return slugs.map((slug) => ({ id: slug }));
  } catch (_) {
    return [];
  }
}

export async function buildDetailMetadata({ id, basePath, type = "company" }) {
  const data = await writeClient.fetch(
    type === "supplier"
      ? SUPPLIER_BY_ID_OR_SLUG_QUERY
      : COMPANY_BY_ID_OR_SLUG_QUERY,
    { id }
  );
  if (!data) return {};

  const name = data.name || (type === "supplier" ? "مورد" : "شركة");
  const plain = (data.descriptionText || "").trim();
  const description = plain
    ? plain.length > 160
      ? plain.slice(0, 157) + "..."
      : plain
    : `اكتشف خدمات ${name} وتفاصيلها ومعلومات الاتصال.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}${basePath}/${data.slug?.current || id}`;

  const baseKeywords = [
    name,
    type === "supplier" ? "مورد" : "شركة",
    "أعمال",
    "فئات",
  ];
  if (data.locations?.length > 0) {
    const location = data.locations[0];
    if (location.city)
      baseKeywords.push(location.city, `${name} ${location.city}`);
    if (location.region)
      baseKeywords.push(location.region, `${name} ${location.region}`);
    if (location.country) baseKeywords.push(location.country);
  }
  if (data.categories?.length > 0) {
    data.categories.forEach((cat) => {
      if (cat.title) baseKeywords.push(cat.title, `${name} ${cat.title}`);
    });
  }
  if (data.companyType) baseKeywords.push(data.companyType.replace("-", " "));
  if (data.extraServices?.length > 0) {
    data.extraServices.forEach((service) => {
      if (service) baseKeywords.push(service);
    });
  }
  const keywords = [...new Set(baseKeywords)].slice(0, 15);

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
              alt: `شعار ${name} - ملف الأعمال على OrbsAI`,
              width: data.logo?.asset?.metadata?.dimensions?.width || 400,
              height: data.logo?.asset?.metadata?.dimensions?.height || 400,
            },
          ]
        : [
            {
              url: "/next.svg",
              alt: `${name} - ملف الأعمال على OrbsAI`,
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
              alt: `شعار ${name}`,
            },
          ]
        : [
            {
              url: "/next.svg",
              alt: `ملف أعمال ${name}`,
            },
          ],
    },
  };
}

export default async function DirectoryDetailPage({
  params,
  basePath = "/companies",
}) {
  const { id } = await params;
  const type = basePath === "/suppliers" ? "supplier" : "company";
  const result = await writeClient.fetch(
    type === "supplier"
      ? SUPPLIER_BY_ID_OR_SLUG_QUERY
      : COMPANY_BY_ID_OR_SLUG_QUERY,
    { id }
  );
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

  const tenant = {
    id: data?.tenantId || (await params)?.id,
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

  // Fetch user's bookmark status and interaction status on the server to avoid client-side delay
  let isBookmarked = false;
  let interactionStatus = null;
  try {
    const { userId } = await auth();
    if (userId) {
      const bookmarksRes = await writeClient.fetch(USER_BOOKMARK_IDS_QUERY, {
        uid: userId,
      });
      const bookmarkedIds = Array.isArray(bookmarksRes?.bookmarks)
        ? bookmarksRes.bookmarks.map((b) => b?.id).filter(Boolean)
        : [];
      isBookmarked = bookmarkedIds.includes(tenant.id);

      // Fetch company interaction status
      interactionStatus = await getCompanyInteractionStatus(userId, tenant.id);
    }
  } catch (_) {
    // User not logged in or error fetching data
  }

  // Pre-fetch breadcrumb name to avoid client-side loading delay
  const prefetchedNames =
    type === "supplier"
      ? { suppliers: { [id]: data.name } }
      : { companies: { [id]: data.name } };

  return (
    <div className="container mx-auto px-4 my-6 sm:my-8">
      <BreadcrumbPrefetch prefetchedNames={prefetchedNames} />
      <ScrollToTop />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <DirectoryHeader
          tenant={tenant}
          basePath={basePath}
          initialIsBookmarked={isBookmarked}
          initialInteractionStatus={interactionStatus}
        />

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden">
            <DirectoryMap tenant={tenant} />
          </div>
        </div>
      </div>

      <DirectoryOverview tenant={tenant} />

      <DirectoryAccordions
        reviews={data.reviews || []}
        works={data.ourWorks || []}
        awards={data.awards || []}
        isSupplier={type === "supplier"}
        tenant={tenant}
      />
    </div>
  );
}
