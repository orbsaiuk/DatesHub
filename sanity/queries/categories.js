export const ALL_CATEGORIES_QUERY = `
*[_type=="category"] | order(title asc){
  _id,
  title,
  "slug": slug.current,
  icon,
  "iconUrl": icon.asset->url,
  "lqip": icon.asset->metadata.lqip,
  description
}`;

export const CATEGORY_BY_SLUG_QUERY = `
*[_type=="category" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  icon,
  description
}`;

export const ALL_CATEGORIES_BY_TENANT_QUERY = `
*[_type=="category" && ((tenantType == $tenantType && tenantId == $tenantId) || (!defined(tenantType) && !defined(tenantId)))] | order(title asc){
  _id,
  title,
  "slug": slug.current,
  icon,
  "iconUrl": icon.asset->url,
  "lqip": icon.asset->metadata.lqip,
  description
}`;

export const CATEGORY_BY_TENANT_AND_SLUG_QUERY = `
*[_type=="category" && slug.current == $slug && ((tenantType == $tenantType && tenantId == $tenantId) || (!defined(tenantType) && !defined(tenantId)))][0]{
  _id,
  title,
  "slug": slug.current,
  icon,
  description
}`;
