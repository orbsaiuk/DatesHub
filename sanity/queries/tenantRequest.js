export const TENANT_REQUEST_BY_ID_QUERY = `
*[_type == "tenantRequest" && _id == $id][0]{
  _id,
  tenantType,
  requestedBy,
  status,
  createdCompanyId,
  name,
  website,
  email,
  logo,
  description,
  totalEmployees,
  foundingYear,
  registrationNumber,
  companiesHouseUrl,
  companyType,
  categories,
  extraServices,
  socialLinks,
  contact,
  locations,
  openingHours
}
`;
