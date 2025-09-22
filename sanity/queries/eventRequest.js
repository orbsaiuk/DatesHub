// Event Request Queries for Sanity

// Get all event requests for a specific company
export const EVENT_REQUESTS_BY_COMPANY_QUERY = `*[
  _type == "eventRequest" && 
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

// Get all event requests made by a specific user
export const EVENT_REQUESTS_BY_USER_QUERY = `*[
  _type == "eventRequest" && 
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

// Get a specific event request by ID
export const EVENT_REQUEST_BY_ID_QUERY = `*[
  _type == "eventRequest" && 
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

// Get event request statistics for a company
export const EVENT_REQUEST_STATS_QUERY = `{
  "total": count(*[_type == "eventRequest" && targetCompanyTenantId == $companyTenantId]),
  "pending": count(*[_type == "eventRequest" && targetCompanyTenantId == $companyTenantId && status == "pending"]),
  "accepted": count(*[_type == "eventRequest" && targetCompanyTenantId == $companyTenantId && status == "accepted"]),
  "declined": count(*[_type == "eventRequest" && targetCompanyTenantId == $companyTenantId && status == "declined"]),
  "completed": count(*[_type == "eventRequest" && targetCompanyTenantId == $companyTenantId && status == "completed"])
}`;

// Get recent event requests for a company (last 30 days)
export const RECENT_EVENT_REQUESTS_QUERY = `*[
  _type == "eventRequest" && 
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

// Check if user has accepted event requests with a company
export const USER_ACCEPTED_EVENT_REQUESTS_QUERY = `*[
  _type == "eventRequest" && 
  requestedBy == $userId && 
  targetCompanyTenantId == $companyTenantId && 
  status == "accepted"
][0]`;
