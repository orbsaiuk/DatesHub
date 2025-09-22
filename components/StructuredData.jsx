import { urlFor } from "@/sanity/lib/image";

export default function StructuredData({ data }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Website schema for the main site
export function generateWebsiteSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OrbsAI",
    description:
      "Discover and connect with verified companies and suppliers worldwide",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/companies?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "OrbsAI",
      url: siteUrl,
    },
    mainEntity: {
      "@type": "Organization",
      name: "OrbsAI",
      url: siteUrl,
      description:
        "Business directory platform connecting companies and suppliers",
    },
  };
}

// Organization schema for company pages
export function generateOrganizationSchema(company, siteUrl) {
  if (!company) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": company.locations?.length > 0 ? "LocalBusiness" : "Organization",
    name: company.name,
    url: `${siteUrl}/companies/${company.slug || company.id}`,
    description: company.description || undefined,
    telephone: company.contact?.phone || undefined,
    email: company.contact?.email || undefined,
    foundingDate: company.foundingYear
      ? `${company.foundingYear}-01-01`
      : undefined,
    numberOfEmployees: company.totalEmployees || undefined,
    sameAs: company.socialLinks?.filter(Boolean) || undefined,
  };

  // Add logo if available
  if (company.logo?.asset?.url) {
    schema.logo = {
      "@type": "ImageObject",
      url: company.logo.asset.url,
      width: company.logo.asset.metadata?.dimensions?.width || undefined,
      height: company.logo.asset.metadata?.dimensions?.height || undefined,
    };
    schema.image = schema.logo;
  }

  // Add address for LocalBusiness
  if (company.locations?.length > 0 && schema["@type"] === "LocalBusiness") {
    const location = company.locations[0];
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: location.address || undefined,
      addressLocality: location.city || undefined,
      addressRegion: location.region || undefined,
      addressCountry: location.country || undefined,
      postalCode: location.postalCode || undefined,
    };

    // Add geo coordinates if available
    if (location.geo?.lat && location.geo?.lng) {
      schema.geo = {
        "@type": "GeoCoordinates",
        latitude: location.geo.lat,
        longitude: location.geo.lng,
      };
    }

    // Add opening hours if available
    if (company.openingHours?.length > 0) {
      schema.openingHours = company.openingHours.map(
        (hours) => `${hours.day} ${hours.open}-${hours.close}`
      );
    }
  }

  // Add aggregate rating if available
  if (company.rating > 0 && company.ratingCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: company.rating,
      reviewCount: company.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add services/categories
  if (company.categories?.length > 0) {
    schema.knowsAbout = company.categories.map((cat) => cat.name || cat);
  }

  return schema;
}

// Breadcrumb schema generator
export function generateBreadcrumbSchema(breadcrumbs, siteUrl) {
  if (!breadcrumbs?.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.url}`,
    })),
  };
}

// FAQ schema generator
export function generateFAQSchema(faqItems) {
  if (!faqItems?.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// Product/Service schema for offers
export function generateOfferSchema(offer, siteUrl) {
  if (!offer) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: offer.title,
    description: offer.description,
    url: `${siteUrl}/companies/${offer.company?.slug}`,
    seller: {
      "@type": "Organization",
      name: offer.company?.name,
    },
    validFrom: offer.startDate,
    validThrough: offer.endDate,
    availability: "https://schema.org/InStock",
  };
}
