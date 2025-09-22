import { writeClient } from "@/sanity/lib/serverClient";
import { CATEGORY_BY_SLUG_QUERY } from "@/sanity/queries/categories";

export async function generateCompaniesMetadata(searchParams) {
  const { loc, spec, ctype, sort, q } = searchParams || {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  let title = "Companies";
  let description = "Browse companies";
  let keywords = ["companies"];
  
  // Category-specific metadata
  if (spec) {
    try {
      const category = await writeClient.fetch(CATEGORY_BY_SLUG_QUERY, { slug: spec });
      if (category) {
        title = `${category.title} Companies`;
        description = `Find ${category.title.toLowerCase()} companies. ${category.description || ''}`.trim();
        keywords = [
          category.title,
          `${category.title} companies`
        ];
      }
    } catch (e) {
      // Fallback to generic category metadata
      title = `${spec.replace('-', ' ')} Companies`;
      description = `Find ${spec.replace('-', ' ')} companies`;
    }
  }
  
  // Location-specific metadata
  if (loc) {
    const locationName = decodeURIComponent(loc);
    if (spec) {
      title = `${title} in ${locationName}`;
      description = `Find ${spec.replace('-', ' ')} companies in ${locationName}.`;
      keywords.push(locationName, `${spec} ${locationName}`, `companies in ${locationName}`);
    } else {
      title = `Companies in ${locationName}`;
      description = `Discover companies in ${locationName}. Browse local businesses and service providers.`;
      keywords = [
        locationName,
        `companies in ${locationName}`
      ];
    }
  }
  
  // Event type specific metadata
  if (ctype && ctype !== 'all') {
    const typeLabel = ctype.replace('-', ' ');
    title = `${typeLabel} Companies${loc ? ` in ${decodeURIComponent(loc)}` : ''}`;
    description = `Find ${typeLabel} companies${loc ? ` in ${decodeURIComponent(loc)}` : ''}.`;
    keywords.push(typeLabel, `${typeLabel} companies`, `${typeLabel} services`);
  }
  
  // Search query specific metadata
  if (q) {
    title = `"${q}" Companies${loc ? ` in ${decodeURIComponent(loc)}` : ''}`;
    description = `Search results for "${q}" companies${loc ? ` in ${decodeURIComponent(loc)}` : ''}.`;
    keywords.push(q, `${q} companies`, `${q} services`);
  }
  
  // Build canonical URL with filters
  const urlParams = new URLSearchParams();
  if (loc) urlParams.set('loc', loc);
  if (spec) urlParams.set('spec', spec);
  if (ctype && ctype !== 'all') urlParams.set('ctype', ctype);
  if (q) urlParams.set('q', q);
  if (sort && sort !== 'name-asc') urlParams.set('sort', sort);
  
  const canonicalUrl = `${siteUrl}/companies${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
  
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
      images: [{
        url: "/next.svg",
        alt: `${title} - OrbsAI`
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{
        url: "/next.svg",
        alt: `${title} directory`
      }],
    },
  };
}
