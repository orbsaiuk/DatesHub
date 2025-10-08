// Order Request Queries for Sanity

// Get all order requests for a specific company
export const ORDER_REQUESTS_BY_COMPANY_QUERY = `*[
  _type == "orderRequest" && 
  targetCompanyTenantId == $companyTenantId
] | order(createdAt desc) {
  _id,
  title,
  fullName,
  eventDate,
  eventTime,
  numberOfGuests,
  serviceRequired,
  eventLocation,
  eventDescription,
  status,
  priority,
  requestedBy,
  companyResponse,
  responseDate,
  createdAt,
  updatedAt
}`;

// Get all order requests made by a specific user
export const ORDER_REQUESTS_BY_USER_QUERY = `*[
  _type == "orderRequest" && 
  requestedBy == $userId
] | order(createdAt desc) {
  _id,
  title,
  fullName,
  eventDate,
  eventTime,
  numberOfGuests,
  serviceRequired,
  eventLocation,
  eventDescription,
  status,
  priority,
  targetCompanyTenantId,
  companyResponse,
  responseDate,
  createdAt,
  updatedAt
}`;

// Get a specific order request by ID
export const ORDER_REQUEST_BY_ID_QUERY = `*[
  _type == "orderRequest" && 
  _id == $id
][0] {
  _id,
  title,
  fullName,
  eventDate,
  eventTime,
  numberOfGuests,
  serviceRequired,
  eventLocation,
  eventDescription,
  status,
  priority,
  targetCompanyTenantId,
  requestedBy,
  companyResponse,
  responseDate,
  createdAt,
  updatedAt
}`;

// Get order request statistics for a company
export const ORDER_REQUEST_STATS_QUERY = `{
  "total": count(*[_type == "orderRequest" && targetCompanyTenantId == $companyTenantId]),
  "pending": count(*[_type == "orderRequest" && targetCompanyTenantId == $companyTenantId && status == "pending"]),
  "accepted": count(*[_type == "orderRequest" && targetCompanyTenantId == $companyTenantId && status == "accepted"]),
  "declined": count(*[_type == "orderRequest" && targetCompanyTenantId == $companyTenantId && status == "declined"]),
  "completed": count(*[_type == "orderRequest" && targetCompanyTenantId == $companyTenantId && status == "completed"])
}`;

// Get recent order requests for a company (last 30 days)
export const RECENT_ORDER_REQUESTS_QUERY = `*[
  _type == "orderRequest" && 
  targetCompanyTenantId == $companyTenantId &&
  createdAt > $dateFrom
] | order(createdAt desc) {
  _id,
  title,
  fullName,
  eventDate,
  serviceRequired,
  status,
  priority,
  createdAt
}`;

// Check if user has accepted order requests with a company
export const USER_ACCEPTED_ORDER_REQUESTS_QUERY = `*[
  _type == "orderRequest" && 
  requestedBy == $userId && 
  targetCompanyTenantId == $companyTenantId && 
  status == "accepted"
][0]`;

// Legacy exports for backward compatibility
export const EVENT_REQUESTS_BY_COMPANY_QUERY = ORDER_REQUESTS_BY_COMPANY_QUERY;
export const EVENT_REQUESTS_BY_USER_QUERY = ORDER_REQUESTS_BY_USER_QUERY;
export const EVENT_REQUEST_BY_ID_QUERY = ORDER_REQUEST_BY_ID_QUERY;
export const EVENT_REQUEST_STATS_QUERY = ORDER_REQUEST_STATS_QUERY;
export const RECENT_EVENT_REQUESTS_QUERY = RECENT_ORDER_REQUESTS_QUERY;
export const USER_ACCEPTED_EVENT_REQUESTS_QUERY = USER_ACCEPTED_ORDER_REQUESTS_QUERY;
