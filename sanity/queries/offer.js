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
  views,
  description
}`;

export const OFFER_STATS_BY_TENANT_QUERY = `
{
  "total": count(*[_type == "offers" && tenantType == $tenantType && tenantId == $tenantId]),
  "active": count(*[_type == "offers" && tenantType == $tenantType && tenantId == $tenantId && status == "active"]),
  "inactive": count(*[_type == "offers" && tenantType == $tenantType && tenantId == $tenantId && status == "inactive"]),
}
`;

export const PUBLIC_COMPANY_OFFERS_QUERY = `
*[_type == "offers" && tenantType == "company" && status == "active" && (
  !defined(startDate) || startDate <= now()
) && (
  !defined(endDate) || endDate >= now()
)] | order(_createdAt desc)[0...6]{
  _id,
  title,
  description,
  image{
    asset->{url}
  },
  startDate,
  endDate,
  company->{
    name,
    logo{
      asset->{url}
    }
  }
}`;

export const COMPANY_SUPPLIER_OFFERS_QUERY = `
*[_type == "offers" && tenantType == "supplier" && status == "active" && (
  !defined(startDate) || startDate <= now()
) && (
  !defined(endDate) || endDate >= now()
)] | order(_createdAt desc)[0...6]{
  _id,
  title,
  description,
  image{
    asset->{url}
  },
  startDate,
  endDate,
  supplier->{
    name,
    logo{
      asset->{url}
    }
  }
}`;
