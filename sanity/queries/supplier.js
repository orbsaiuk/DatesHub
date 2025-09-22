export const SUPPLIER_BY_TENANT_QUERY = `
*[_type == "supplier" && tenantType == $tenantType && tenantId == $tenantId][0]{
  _id,
  name,
  slug,
  website,
  logo,
  locations,
  "totalViews": coalesce(totalViews, 0),
  description,
  contact,
  openingHours,
  categories,
  extraServices,
  foundingYear,
  registrationNumber,
  ourWorks,
  awards,
  "descriptionText": pt::text(description),
  "locationString": coalesce(
    select(
      defined(locations[0].address) && defined(locations[0].city) && defined(locations[0].region) && defined(locations[0].country) =>
        locations[0].address + ", " + locations[0].city + ", " + locations[0].region + ", " + locations[0].country,
      defined(locations[0].address) && defined(locations[0].city) && defined(locations[0].country) =>
        locations[0].address + ", " + locations[0].city + ", " + locations[0].country,
      defined(locations[0].address) && defined(locations[0].country) =>
        locations[0].address + ", " + locations[0].country,
      defined(locations[0].city) && defined(locations[0].region) && defined(locations[0].country) =>
        locations[0].city + ", " + locations[0].region + ", " + locations[0].country,
      defined(locations[0].city) && defined(locations[0].country) =>
        locations[0].city + ", " + locations[0].country
    ),
    locations[0].country
  ),
}`;

export const SUPPLIER_TENANT_IDS_QUERY = `
*[_type=="supplier" && defined(tenantId) && tenantType == 'supplier'].tenantId
`;

export const SUPPLIER_SLUGS_QUERY = `
*[_type=="supplier" && defined(slug.current)].slug.current
`;

export const SUPPLIER_BY_TENANTID_OR_SLUG_QUERY = `
*[_type == "supplier" && (tenantId == $id || slug.current == $id)][0]{ _id }
`;

export const SUPPLIER_BY_ID_OR_SLUG_QUERY = `
*[_type == "supplier" && (tenantId == $id || slug.current == $id)][0]{
  _id,
  tenantId,
  name,
  slug,
  rating,
  ratingCount,
  "totalViews": coalesce(totalViews, 0),
  verifiedLabel,
  website,
  logo,
  description,
  "descriptionText": pt::text(description),
  foundingYear,
  registrationNumber,
  contact,
  locations,
  categories,
  extraServices,
  openingHours,
  ourWorks,
  awards,
  "addressLine": select(
    defined(locations[0]) => select(
      defined(locations[0].address) && defined(locations[0].city) && defined(locations[0].region) && defined(locations[0].country) =>
        locations[0].address + ", " + locations[0].city + ", " + locations[0].region + ", " + locations[0].country,
      defined(locations[0].address) && defined(locations[0].city) && defined(locations[0].country) =>
        locations[0].address + ", " + locations[0].city + ", " + locations[0].country,
      defined(locations[0].address) && defined(locations[0].country) =>
        locations[0].address + ", " + locations[0].country,
      defined(locations[0].city) && defined(locations[0].region) && defined(locations[0].country) =>
        locations[0].city + ", " + locations[0].region + ", " + locations[0].country,
      defined(locations[0].city) && defined(locations[0].country) =>
        locations[0].city + ", " + locations[0].country
    ),
    locations[0].country
  ),
}`;

// Query for supplier dashboard data
export const SUPPLIER_DASHBOARD_QUERY = `
*[_type == "supplier" && tenantId == $tenantId][0]{
  _id,
  name,
  logo,
  website,
  description,
  "descriptionText": pt::text(description),
  categories,
  extraServices,
  locations,
  contact,
  openingHours,
  "totalViews": coalesce(totalViews, 0),
  "viewsRecent": views | order(createdAt desc)[0...1000]{ createdAt },
  "messagesCount": 0,
  ourWorks,
  awards,
}`;

export const USER_SUPPLIER_MEMBERSHIPS_QUERY = `
*[_type == "user" && clerkId == $userId][0]{
  memberships[tenantType == "supplier"]{
    tenantId,
    role,
    "supplier": *[_type=="supplier" && tenantId == ^.tenantId][0]{
      _id, name, logo, tenantId
    }
  }
}`;

export const SUPPLIER_EDIT_QUERY = `
*[_type == "supplier" && tenantId == $tenantId][0]{
  _id,
  tenantId,
  name,
  slug,
  website,
  logo,
  description,
  "descriptionText": pt::text(description),
  foundingYear,
  registrationNumber,
  contact,
  locations,
  categories,
  extraServices,
  openingHours,
  ourWorks,
  awards,
}`;
