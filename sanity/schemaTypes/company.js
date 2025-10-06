import { defineField, defineType } from "sanity";

export default defineType({
  name: "company",
  title: "Company",
  type: "document",
  fields: [
    defineField({
      name: "tenantType",
      title: "Tenant Type",
      type: "string",
      initialValue: "company",
      readOnly: true,
      hidden: true,
      readOnly: true,
      validation: (Rule) => Rule.required().valid("company"),
    }),
    defineField({
      name: "tenantId",
      title: "Tenant ID",
      type: "string",
      description:
        "Unique identifier for this company tenant. Used in routing and data isolation.",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      readOnly: true,
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      readOnly: true,
    }),
    defineField({
      name: "website",
      title: "Website URL",
      type: "url",
      readOnly: true,
    }),
    defineField({
      name: "totalEmployees",
      title: "Total Employees",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "foundingYear",
      title: "Founding Year",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "registrationNumber",
      title: "Company Registration Number",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "companiesHouseUrl",
      title: "Companies House URL",
      type: "url",
      description: "Official Companies House profile link",
      readOnly: true,
    }),
    defineField({
      name: "socialLinks",
      title: "Social Media Links",
      type: "array",
      of: [{ type: "url" }],
    }),
    defineField({
      name: "contact",
      title: "Contact Details",
      type: "object",
      fields: [
        defineField({ name: "ownerName", title: "Owner Name", type: "string" }),
        defineField({ name: "email", title: "Email Address", type: "string" }),
        defineField({ name: "phone", title: "Phone Number", type: "string" }),
        defineField({ name: "address", title: "Home Address", type: "string" }),
      ],
    }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      options: {
        list: [
          { title: "Full Event Planner", value: "full-event-planner" },
          { title: "Kids Birthday", value: "kids-birthday" },
          { title: "Wedding", value: "wedding" },
          { title: "Social Gathering", value: "social-gathering" },
          { title: "Corporate Event", value: "corporate-event" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "extraServices",
      title: "Extra Services",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "locations",
      title: "Locations",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "address", title: "Address", type: "string" }),
            defineField({ name: "city", title: "City", type: "string" }),
            defineField({
              name: "region",
              title: "State/Region",
              type: "string",
            }),
            defineField({ name: "country", title: "Country", type: "string" }),
            defineField({ name: "zipCode", title: "Zip Code", type: "string" }),
            defineField({ name: "geo", title: "Geo", type: "geopoint" }),
          ],
        },
      ],
    }),
    defineField({
      name: "openingHours",
      title: "Opening Hours (display order)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "rating",
      title: "Average Rating",
      type: "number",
      readOnly: true,
      description: "Optional cache. You can compute in GROQ from reviews.",
    }),
    defineField({
      name: "ratingCount",
      title: "Rating Count",
      type: "number",
      readOnly: true,
      description: "Optional cache. You can compute in GROQ from reviews.",
    }),
    defineField({
      name: "totalViews",
      title: "Total Views",
      type: "number",
      readOnly: true,
      initialValue: 0,
      description:
        "Total number of public page views. Auto-incremented via API.",
    }),
    defineField({
      name: "views",
      title: "View Keys",
      type: "array",
      readOnly: true,
      description: "Internal deduplication keys for views (per IP per day).",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "key", title: "Key", type: "string" }),
            defineField({
              name: "createdAt",
              title: "Created At",
              type: "datetime",
            }),
          ],
        },
      ],
    }),

    defineField({
      name: "subscription",
      title: "Current Subscription",
      type: "reference",
      to: [{ type: "subscription" }],
      description: "Current active subscription for this company",
    }),
    defineField({
      name: "offers",
      title: "Offers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "offers" }] }],
      readOnly: true,
      description:
        "Back-reference to offers created for this company. Managed via Offers content type.",
    }),
  ],
  preview: {
    select: { title: "name", media: "logo" },
  },
});
