export default {
  name: "orderRequest",
  title: "Order Request",
  type: "document",
  fields: [
    {
      name: "business",
      title: "Business",
      type: "reference",
      validation: (Rule) => Rule.required(),
      to: [{ type: "company" }, { type: "supplier" }],
    },
    {
      name: "user",
      title: "User",
      type: "reference",
      validation: (Rule) => Rule.required(),
      to: [{ type: "user" }],
      description: "The user who made this order request",
    },
    {
      name: "fullName",
      title: "Client Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "deliveryDate",
      title: "Delivery Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "quantity",
      title: "Quantity (kg)",
      type: "number",
      validation: (Rule) => Rule.required(),
      description: "Quantity in kilograms",
    },
    {
      name: "category",
      title: "Dates Type",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "The type of dates requested",
    },
    {
      name: "deliveryAddress",
      title: "Delivery Address",
      type: "string",
      validation: (Rule) => Rule.required().min(5).max(300),
    },
    {
      name: "additionalNotes",
      title: "Additional Notes",
      type: "text",
      validation: (Rule) => Rule.optional().min(10).max(1000),
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
      description: "The tenant ID of the company this order request is for",
      hidden: true,
    },
    {
      name: "requestedBy",
      title: "Requested By (User ID)",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "The user ID of the person making the order",
      hidden: true,
    },
    {
      name: "companyResponse",
      title: "Company Response",
      type: "text",
      description: "Response message from the company",
    },
    {
      name: "responseDate",
      title: "Response Date",
      type: "datetime",
      description: "When the company responded to the order",
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
      fullName: "fullName",
      deliveryDate: "deliveryDate",
    },
    prepare({ fullName, deliveryDate }) {
      const date = deliveryDate
        ? new Date(deliveryDate).toLocaleDateString()
        : "No date";
      return {
        title: `Order Request by ${fullName}`,
        subtitle: `${date} • ${fullName}`,
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
      title: "Delivery Date, Upcoming",
      name: "deliveryDateAsc",
      by: [{ field: "deliveryDate", direction: "asc" }],
    },
    {
      title: "Status",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
  ],
};
