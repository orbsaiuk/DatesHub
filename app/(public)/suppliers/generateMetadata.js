import { writeClient } from "@/sanity/lib/serverClient";
import { CATEGORY_BY_SLUG_QUERY } from "@/sanity/queries/categories";

export async function generateSuppliersMetadata(searchParams) {
  const { loc, spec, ctype, sort, q } = searchParams || {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let title = "الموردين";
  let description = "تصفح الموردين";
  let keywords = ["موردين"];

  if (spec) {
    try {
      const category = await writeClient.fetch(CATEGORY_BY_SLUG_QUERY, {
        slug: spec,
      });
      if (category) {
        title = `موردين ${category.title}`;
        description =
          `اعثر على موردين ${category.title.toLowerCase()}. ${category.description || ""}`.trim();
        keywords = [category.title, `موردين ${category.title}`];
      }
    } catch (_) {
      title = `موردين ${String(spec).replace("-", " ")}`;
      description = `اعثر على موردين ${String(spec).replace("-", " ")}`;
    }
  }

  if (loc) {
    const locationName = decodeURIComponent(loc);
    if (spec) {
      title = `${title} في ${locationName}`;
      description = `اعثر على موردين ${String(spec).replace("-", " ")} في ${locationName}.`;
      keywords.push(
        locationName,
        `${spec} ${locationName}`,
        `موردين في ${locationName}`
      );
    } else {
      title = `موردين في ${locationName}`;
      description = `اكتشف الموردين في ${locationName}. تصفح الأعمال ومقدمي الخدمات المحليين.`;
      keywords = [locationName, `موردين في ${locationName}`];
    }
  }

  if (ctype && ctype !== "all") {
    const typeLabel = ctype.replace("-", " ");
    title = `موردين ${typeLabel}${loc ? ` في ${decodeURIComponent(loc)}` : ""}`;
    description = `اعثر على موردين ${typeLabel}${loc ? ` في ${decodeURIComponent(loc)}` : ""}.`;
    keywords.push(typeLabel, `موردين ${typeLabel}`, `خدمات ${typeLabel}`);
  }

  if (q) {
    title = `موردين "${q}"${loc ? ` في ${decodeURIComponent(loc)}` : ""}`;
    description = `نتائج البحث عن موردين "${q}"${loc ? ` في ${decodeURIComponent(loc)}` : ""}.`;
    keywords.push(q, `موردين ${q}`, `خدمات ${q}`);
  }

  const urlParams = new URLSearchParams();
  if (loc) urlParams.set("loc", loc);
  if (spec) urlParams.set("spec", spec);
  if (ctype && ctype !== "all") urlParams.set("ctype", ctype);
  if (q) urlParams.set("q", q);
  if (sort && sort !== "name-asc") urlParams.set("sort", sort);

  const canonicalUrl = `${siteUrl}/suppliers${urlParams.toString() ? `?${urlParams.toString()}` : ""}`;

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
      siteName: "OrbsAI",
      images: [
        {
          url: "/next.svg",
          alt: `${title} - OrbsAI`,
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
