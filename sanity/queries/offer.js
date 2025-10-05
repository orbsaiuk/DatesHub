export const OFFERS_BY_TENANT_QUERY = `
*[_type == "offers" && tenantType == $tenantType && tenantId == $tenantId] | order(_createdAt desc){
  _id,
  title,
  image{
    asset->{_id, url}
  },
  startDate,
  endDate,
  status,
  deactivatedAt,
  description,
  company->{
    name,
    logo{
      asset->{url}
    }
  },
  supplier->{
    name,
    logo{
      asset->{url}
    }
  }
}`;

export const OFFER_STATS_BY_TENANT_QUERY = `
{
  "total": count(*[_type == "offers" && tenantType == $tenantType && tenantId == $tenantId]),
  "active": count(*[_type == "offers" && tenantType == $tenantType && tenantId == $tenantId && status == "active"]),
  "inactive": count(*[_type == "offers" && tenantType == $tenantType && tenantId == $tenantId && status == "inactive"]),
}
`;

// These queries are deprecated - use promotional banners for home page instead
// Keeping for backward compatibility, but should not be used for new features
