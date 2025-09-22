export const SITE_SETTINGS_QUERY = `
*[_type == "siteSettings"][0]{
  heroTitle,
  heroDescription,
  logo,
  footerText,
  contact{
    email,
    phone,
    address
  },
  socialLinks{
    facebook,
    twitter,
    instagram,
    linkedin,
    youtube
  },
  seo{
    metaTitle,
    metaDescription,
    ogImage
  },
  faq[]{q, a},
  how[]{title, description, bullets, icon},
  why[]{title, description}
}`;
