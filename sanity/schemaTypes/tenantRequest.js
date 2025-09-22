import { defineField, defineType } from "sanity";

export default defineType({
  name: "tenantRequest",
  title: "Tenant Onboarding Request",
  type: "document",
  fields: [
    defineField({
      name: "tenantType",
      title: "Tenant Type",
      type: "string",
      options: {
        list: [
          { title: "Company", value: "company" },
          { title: "Supplier", value: "supplier" },
        ],
      },
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),

    defineField({
      name: "requestedBy",
      title: "Requested By (Clerk ID)",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
      // status is intentionally editable
    }),
    defineField({
      name: "companiesHouseUrl",
      title: "Companies House URL",
      type: "url",
      description:
        "Add the official Companies House profile URL when approving.",
      hidden: ({ document }) => document?.status !== "approved",
      validation: (Rule) =>
        Rule.uri({ scheme: ["https"] }).custom((val, context) => {
          const isApproved = context?.document?.status === "approved";
          if (isApproved && !val) {
            return "Companies House URL is required when status is Approved.";
          }
          if (val) {
            const pattern =
              /^https:\/\/find-and-update\.company-information\.service\.gov\.uk\/company\/[A-Za-z0-9]+\/?$/;
            if (!pattern.test(val)) {
              return "Enter a valid Companies House company URL.";
            }
          }
          return true;
        }),
    }),
    // Track created company to avoid duplicates
    defineField({
      name: "createdCompanyId",
      title: "Created Company Document ID",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    // Basic business info
    defineField({
      name: "name",
      title: "Business Name",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      readOnly: true,
    }),
    defineField({
      name: "email",
      title: "Contact Email",
      type: "string",
      readOnly: true,
    }),
    defineField({ name: "logo", title: "Logo", type: "image", readOnly: true }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      readOnly: true,
    }),
    defineField({
      name: "totalEmployees",
      title: "Total Employees",
      type: "string",
      readOnly: true,
      hidden: ({ document }) => document?.tenantType === "supplier",
    }),
    defineField({
      name: "foundingYear",
      title: "Founding Year",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "registrationNumber",
      title: "Registration Number",
      type: "number",
      readOnly: true,
    }),

    defineField({
      name: "companyType",
      title: "Company Type",
      type: "string",
      options: {
        list: [
          { title: "Full Event Planner", value: "full-event-planner" },
          { title: "Specialist", value: "specialist" },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: "openingHours",
      title: "Opening Hours",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      readOnly: true,
    }),
    defineField({
      name: "extraServices",
      title: "Extra Services",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [{ type: "url" }],
      readOnly: true,
      hidden: ({ document }) => document?.tenantType === "supplier",
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      readOnly: true,
      fields: [
        { name: "ownerName", title: "Owner Name", type: "string" },
        { name: "phone", title: "Phone", type: "string" },
        { name: "email", title: "Email", type: "string" },
        { name: "address", title: "Address", type: "string" },
      ],
    }),
    defineField({
      name: "locations",
      title: "Locations",
      type: "array",
      readOnly: true,
      of: [
        {
          type: "object",
          title: "Location",
          fields: [
            { name: "country", title: "Country", type: "string" },
            { name: "city", title: "City", type: "string" },
            { name: "address", title: "Address", type: "string" },
            { name: "region", title: "Region", type: "string" },
            { name: "zipCode", title: "Zip Code", type: "string" },
            { name: "geo", title: "Geo", type: "geopoint" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "status", media: "logo" },
  },
});
