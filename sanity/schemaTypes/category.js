import { defineField, defineType } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "tenantType",
      title: "Tenant Type (optional)",
      type: "string",
      options: {
        list: [
          { title: "User", value: "user" },
          { title: "Company", value: "company" },
          { title: "Supplier", value: "supplier" },
        ],
        layout: "radio",
      },
      description: "Leave empty for global categories shared across tenants.",
    }),
    defineField({
      name: "tenantId",
      title: "Tenant ID (optional)",
      type: "string",
      description: "Leave empty for global categories.",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: { title: "title", media: "icon" },
  },
});
