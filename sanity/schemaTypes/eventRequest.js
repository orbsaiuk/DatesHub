export default {
  name: "eventRequest",
  title: "Event Request",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Request Title",
      type: "string",
      validation: (Rule) => Rule.required().min(1).max(100),
    },
    {
      name: "fullName",
      title: "Client Full Name",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(100),
    },
    {
      name: "eventDate",
      title: "Event Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "eventTime",
      title: "Event Time",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "numberOfGuests",
      title: "Number of Guests",
      type: "string",
      validation: (Rule) => Rule.required(),
      description:
        "Number of guests (can be a range like '10-20' or single number)",
    },
    {
      name: "category",
      title: "Service Category",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "The category of service requested",
    },
    {
      name: "serviceRequired",
      title: "Service Required",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(200),
    },
    {
      name: "eventLocation",
      title: "Event Location",
      type: "string",
      validation: (Rule) => Rule.required().min(5).max(300),
    },
    {
      name: "eventDescription",
      title: "Event Description",
      type: "text",
      validation: (Rule) => Rule.required().min(10).max(1000),
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Accepted", value: "accepted" },
          { title: "Declined", value: "declined" },
        ],
      },
      initialValue: "pending",
    },
    {
      name: "targetCompanyTenantId",
      title: "Target Company Tenant ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "The tenant ID of the company this event request is for",
      hidden: true,
    },
    {
      name: "requestedBy",
      title: "Requested By (User ID)",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "The user ID of the person making the request",
      hidden: true,
    },
    {
      name: "companyResponse",
      title: "Company Response",
      type: "text",
      description: "Optional response message from the company",
    },
    {
      name: "responseDate",
      title: "Response Date",
      type: "datetime",
      description: "When the company responded to the request",
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
      hidden: true,
    },
    {
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      hidden: true,
    },
  ],
  preview: {
    select: {
      title: "title",
      fullName: "fullName",
      eventDate: "eventDate",
      status: "status",
    },
    prepare({ title, fullName, eventDate, status }) {
      const date = eventDate
        ? new Date(eventDate).toLocaleDateString()
        : "No date";
      return {
        title: title || `Event Request by ${fullName}`,
        subtitle: `${date} • ${status} • ${fullName}`,
      };
    },
  },
  orderings: [
    {
      title: "Created Date, New",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Event Date, Upcoming",
      name: "eventDateAsc",
      by: [{ field: "eventDate", direction: "asc" }],
    },
    {
      title: "Status",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
  ],
};
