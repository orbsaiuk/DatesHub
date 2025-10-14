import { writeClient } from "@/sanity/lib/serverClient";
import { CATEGORY_BY_SLUG_QUERY } from "@/sanity/queries/categories";

export async function generateCompaniesMetadata(searchParams) {
  const { loc, spec, ctype, sort, q } = searchParams || {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let title = "الشركات";
  let description = "تصفح الشركات";
  let keywords = ["شركات"];

  // Category-specific metadata
  if (spec) {
    try {
      const category = await writeClient.fetch(CATEGORY_BY_SLUG_QUERY, {
        slug: spec,
      });
      if (category) {
        title = `شركات ${category.title}`;
        description =
          `اعثر على شركات ${category.title.toLowerCase()}. ${category.description || ""}`.trim();
        keywords = [category.title, `شركات ${category.title}`];
      }
    } catch (e) {
      // Fallback to generic category metadata
      title = `شركات ${spec.replace("-", " ")}`;
      description = `اعثر على شركات ${spec.replace("-", " ")}`;
    }
  }

  // Location-specific metadata
  if (loc) {
    const locationName = decodeURIComponent(loc);
    if (spec) {
      title = `${title} في ${locationName}`;
      description = `اعثر على شركات ${spec.replace("-", " ")} في ${locationName}.`;
      keywords.push(
        locationName,
        `${spec} ${locationName}`,
        `شركات في ${locationName}`
      );
    } else {
      title = `شركات في ${locationName}`;
      description = `اكتشف الشركات في ${locationName}. تصفح الأعمال ومقدمي الخدمات المحليين.`;
      keywords = [locationName, `شركات في ${locationName}`];
    }
  }

  // Event type specific metadata
  if (ctype && ctype !== "all") {
    const typeLabel = ctype.replace("-", " ");
    title = `شركات ${typeLabel}${loc ? ` في ${decodeURIComponent(loc)}` : ""}`;
    description = `اعثر على شركات ${typeLabel}${loc ? ` في ${decodeURIComponent(loc)}` : ""}.`;
    keywords.push(typeLabel, `شركات ${typeLabel}`, `خدمات ${typeLabel}`);
  }

  // Search query specific metadata
  if (q) {
    title = `شركات "${q}"${loc ? ` في ${decodeURIComponent(loc)}` : ""}`;
    description = `نتائج البحث عن شركات "${q}"${loc ? ` في ${decodeURIComponent(loc)}` : ""}.`;
    keywords.push(q, `شركات ${q}`, `خدمات ${q}`);
  }

  // Build canonical URL with filters
  const urlParams = new URLSearchParams();
  if (loc) urlParams.set("loc", loc);
  if (spec) urlParams.set("spec", spec);
  if (ctype && ctype !== "all") urlParams.set("ctype", ctype);
  if (q) urlParams.set("q", q);
  if (sort && sort !== "name-asc") urlParams.set("sort", sort);

  const canonicalUrl = `${siteUrl}/companies${urlParams.toString() ? `?${urlParams.toString()}` : ""}`;

  return {
    title,
    description,
    keywords: [...new Set(keywords)].slice(0, 12),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "DatesHub",
      images: [
        {
          url: "/next.svg",
          alt: `${title} - DatesHub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: "/next.svg",
          alt: `${title} directory`,
        },
      ],
    },
  };
}
