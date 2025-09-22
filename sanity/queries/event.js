// Event queries for Sanity
export const EVENTS_BY_TENANT_QUERY = `
  *[_type == "event" && tenantId == $tenantId] | order(startDate asc) {
    _id,
    title,
    description,
    startDate,
    endDate,
    location,
    status,
    priority,
    clientContact,
    _createdAt,
    _updatedAt
  }
`;

export const EVENT_BY_ID_QUERY = `
  *[_type == "event" && _id == $eventId][0] {
    _id,
    title,
    description,
    startDate,
    endDate,
    location,
    status,
    priority,
    clientContact,
    tenantId,
    createdBy,
    _createdAt,
    _updatedAt
  }
`;

export const EVENTS_BY_DATE_RANGE_QUERY = `
  *[_type == "event" && tenantId == $tenantId && startDate >= $startDate && startDate <= $endDate] | order(startDate asc) {
    _id,
    title,
    description,
    startDate,
    endDate,
    location,
    status,
    priority,
    clientContact,
    _createdAt,
    _updatedAt
  }
`;

export const UPCOMING_EVENTS_QUERY = `
  *[_type == "event" && tenantId == $tenantId && startDate >= now()] | order(startDate asc) [0...5] {
    _id,
    title,
    startDate,
    endDate,
    status,
    priority
  }
`;

export const EVENT_STATS_QUERY = `
  {
    "total": count(*[_type == "event" && tenantId == $tenantId]),
    "upcoming": count(*[_type == "event" && tenantId == $tenantId && startDate >= now()]),
    "thisMonth": count(*[_type == "event" && tenantId == $tenantId && startDate >= $monthStart && startDate <= $monthEnd]),
    "byStatus": {
      "planned": count(*[_type == "event" && tenantId == $tenantId && status == "planned"]),
      "confirmed": count(*[_type == "event" && tenantId == $tenantId && status == "confirmed"]),
      "inProgress": count(*[_type == "event" && tenantId == $tenantId && status == "in-progress"]),
      "completed": count(*[_type == "event" && tenantId == $tenantId && status == "completed"]),
      "cancelled": count(*[_type == "event" && tenantId == $tenantId && status == "cancelled"])
    }
  }
`;
