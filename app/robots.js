const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/companies", "/company"],
        disallow: [
          "/sign-in",
          "/sign-up",
          "/become",
          "/business",
          "/bookmarks",
          "/api",
          "/studio",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/companies/*"],
        disallow: [
          "/sign-in*",
          "/sign-up*",
          "/become*",
          "/business*",
          "/bookmarks*",
          "/api/*",
          "/studio*",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
