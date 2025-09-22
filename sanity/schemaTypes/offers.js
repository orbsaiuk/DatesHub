import { defineField, defineType } from "sanity";

export default defineType({
  name: "offers",
  title: "Offers",
  type: "document",
  fields: [
    defineField({
      name: "tenantType",
      title: "Tenant Type",
      type: "string",
      description: "Whether this offer belongs to a company or supplier",
      validation: (Rule) => Rule.required().valid("company", "supplier"),
    }),
    defineField({
      name: "tenantId",
      title: "Tenant ID",
      type: "string",
      description: "The tenantId of the owning company/supplier",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "reference",
      to: [{ type: "company" }],
      description: "Only set when tenantType is company",
    }),
    defineField({
      name: "supplier",
      title: "Supplier",
      type: "reference",
      to: [{ type: "supplier" }],
      description: "Only set when tenantType is supplier",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "packageDetails",
      title: "Package Details",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "active",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "deactivatedAt",
      title: "Deactivated At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
    }),
    defineField({
      name: "views",
      title: "Views",
      type: "number",
      readOnly: true,
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "status",
    },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle === "active" ? "Active" : "Inactive" };
    },
  },
});
