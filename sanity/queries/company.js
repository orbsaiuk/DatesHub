export const COMPANY_BY_TENANT_QUERY = `
*[_type == "company" && tenantType == $tenantType && tenantId == $tenantId][0]{
  _id,
  name,
  slug,
  rating,
  ratingCount,
  "totalViews": coalesce(totalViews, 0),
  
  openingHours,
  website,
  logo,
  locations,
  description,
  totalEmployees,
  foundingYear,
  registrationNumber,
  socialLinks,
  contact,
  companyType,
  categories,
  extraServices,
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
  ourWorks,
  awards,
  "reviews": *[_type=="review" && tenantType == $tenantType && tenantId == $tenantId && company._ref == ^._id] | order(createdAt desc)[0...50]{
    _id, title, rating, content, authorName, createdAt
  }
}`;

export const COMPANY_TENANT_IDS_QUERY = `
*[_type=="company" && defined(tenantId) && tenantType == 'company'].tenantId
`;

export const COMPANY_SLUGS_QUERY = `
*[_type=="company" && defined(slug.current)].slug.current
`;

export const COMPANY_BY_TENANTID_OR_SLUG_QUERY = `
*[_type == "company" && (tenantId == $id || slug.current == $id)][0]{ _id }
`;

export const COMPANY_BY_ID_OR_SLUG_QUERY = `
*[_type == "company" && (tenantId == $id || slug.current == $id)][0]{
  _id,
  tenantId,
  name,
  slug,
  rating,
  ratingCount,
  "totalViews": coalesce(totalViews, 0),
  
  openingHours,
  website,
  logo,
  locations,
  description,
  totalEmployees,
  foundingYear,
  registrationNumber,
  socialLinks,
  contact,
  companyType,
  categories,
  extraServices,
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
  ourWorks,
  awards,
  "reviews": *[_type=="review" && company._ref == ^._id] | order(createdAt desc)[0...50]{
    _id, title, rating, content, authorName, createdAt
  }
}`;

// Query for company dashboard data
export const COMPANY_DASHBOARD_QUERY = `
*[_type == "company" && tenantId == $tenantId][0]{
  _id,
  name,
  logo,
  website,
  description,
  "descriptionText": pt::text(description),
  companyType,
  categories,
  extraServices,
  locations,
  socialLinks,
  contact,
  openingHours,
  rating,
  ratingCount,
  
  
  ourWorks,
  awards,
  "totalViews": coalesce(totalViews, 0),
  "worksCount": count(ourWorks),
  "awardsCount": count(awards), 
  "reviewsCount": count(*[_type=="review" && company._ref == ^._id]),
  "viewsRecent": views | order(createdAt desc)[0...1000]{ createdAt },
  "messagesCount": 0,
  "recentReviews": *[_type=="review" && company._ref == ^._id] | order(createdAt desc)[0...3]{
    _id, title, rating, content, authorName, createdAt
  },
}`;

// Query for user's company memberships
export const USER_COMPANY_MEMBERSHIPS_QUERY = `
*[_type == "user" && clerkId == $userId][0]{
  memberships[tenantType == "company"]{
    tenantId,
    role,
    "company": *[_type=="company" && tenantId == ^.tenantId][0]{
      _id, name, logo, tenantId
    }
  }
}`;

// Query for company edit data
export const COMPANY_EDIT_QUERY = `
*[_type == "company" && tenantId == $tenantId][0]{
  _id,
  name,
  description,
  "descriptionText": pt::text(description),
  website,
  logo,
  totalEmployees,
  foundingYear,
  registrationNumber,
  socialLinks,
  contact,
  companyType,
  categories,
  extraServices,
  locations,
  openingHours,
  ourWorks,
  awards
}`;

// Query for company reviews
export const COMPANY_REVIEWS_QUERY = `
*[_type == "company" && tenantId == $tenantId][0]{
  _id,
  name,
  rating,
  ratingCount,
  "reviews": *[_type=="review" && company._ref == ^._id] | order(createdAt desc){
    _id, title, rating, content, authorName, createdAt
  }
}`;
