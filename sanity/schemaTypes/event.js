export default {
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Event Title",
      type: "string",
      validation: (Rule) => Rule.required().min(1).max(100),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    },
    {
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "endDate",
      title: "End Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "location",
      title: "Location",
      type: "string",
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Planned", value: "planned" },
          { title: "Confirmed", value: "confirmed" },
          { title: "In Progress", value: "in-progress" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "planned",
    },
    {
      name: "priority",
      title: "Priority",
      type: "string",
      options: {
        list: [
          { title: "Low", value: "low" },
          { title: "Medium", value: "medium" },
          { title: "High", value: "high" },
          { title: "Urgent", value: "urgent" },
        ],
      },
      initialValue: "medium",
    },
    {
      name: "clientContact",
      title: "Client Contact",
      type: "object",
      fields: [
        { name: "name", title: "Name", type: "string" },
        { name: "email", title: "Email", type: "email" },
        { name: "phone", title: "Phone", type: "string" },
      ],
    },
    {
      name: "tenantId",
      title: "Tenant ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      hidden: true,
    },
    {
      name: "createdBy",
      title: "Created By",
      type: "string",
      validation: (Rule) => Rule.required(),
      hidden: true,
    },
  ],
  preview: {
    select: {
      title: "title",
      startDate: "startDate",
      status: "status",
    },
    prepare({ title, startDate, status }) {
      const date = startDate
        ? new Date(startDate).toLocaleDateString()
        : "No date";
      return {
        title: title,
        subtitle: `${date} • ${status}`,
      };
    },
  },
};
