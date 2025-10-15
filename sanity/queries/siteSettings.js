export const SITE_SETTINGS_QUERY = `
*[_type == "siteSettings"][0]{
  heroTitle,
  heroDescription,
  companyHeroTitle,
  companyHeroDescription,
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
  how[]{title, description, bullets, icon{asset->{url}}},
  why[]{title, description, icon{asset->{url}}},
  companyHow[]{title, description, bullets, icon{asset->{url}}},
  companyWhy[]{title, description, icon{asset->{url}}}
}`;
