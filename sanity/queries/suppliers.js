// Collection queries for suppliers (mirrors companies.js)

export const SUPPLIER_CARD_PROJECTION = `{
  "id": coalesce(tenantId, slug.current),
  tenantId,
  logo{
    asset->{
      url
    }
  },
  name,
  rating,
  ratingCount,
  "location": coalesce(
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
    coalesce(locations[0].address, locations[0].city, locations[0].region, locations[0].country)
  ),
  openingHours,
  "description": pt::text(description),
  extraServices,
  tenantType,
  supplierType
}`;

export const SUPPLIERS_LIST_QUERY = `
*[_type == "supplier"] | order(name asc) ${SUPPLIER_CARD_PROJECTION}
`;

export const SUPPLIER_CITY_REGION_QUERY = `
array::unique(
  *[_type == "supplier" && (defined(locations[0].city) || defined(locations[0].region))]{
    "cr": coalesce(
      select(
        defined(locations[0].city) && defined(locations[0].region) => locations[0].city + ", " + locations[0].region,
        defined(locations[0].city) => locations[0].city,
        defined(locations[0].region) => locations[0].region
      ),
      ""
    )
  }.cr
)
`;

export function buildSuppliersQuery({
  location,
  specialization, // category slug string
  supplierType, // 'dates-factory' | 'packaging-factory' | 'wrapping-factory' | 'farm' | 'wholesaler' | 'exporter'
  search, // text matches name or description
  tenantType, // optional tenant scoping
  tenantId, // optional tenant scoping
} = {}) {
  const filters = ["_type == 'supplier'"];
  const params = {};

  if (tenantType) {
    filters.push("tenantType == $tenantType");
    params.tenantType = `${tenantType}`;
  }
  if (tenantId) {
    filters.push("tenantId == $tenantId");
    params.tenantId = `${tenantId}`;
  }

  if (location) {
    filters.push(
      "(locations[0].country match $loc || locations[0].city match $loc || locations[0].region match $loc)"
    );
    params.loc = `${location}*`;
  }

  if (specialization) {
    filters.push("count(categories[@->slug.current == $spec]) > 0");
    params.spec = `${specialization}`;
  }

  if (supplierType) {
    filters.push("supplierType == $stype");
    params.stype = `${supplierType}`;
  }

  if (search) {
    filters.push("(name match $q || pt::text(description) match $q)");
    params.q = `${search}*`;
  }

  const where = filters.length ? filters.join(" && ") : "_type == 'supplier'";
  const query = `* [ ${where} ] ${SUPPLIER_CARD_PROJECTION}`;

  return { query, params };
}

export const SUPPLIER_DETAIL_QUERY = `
*[_type == "supplier"]{
  "id": coalesce(tenantId, slug.current)
}.id
`;
