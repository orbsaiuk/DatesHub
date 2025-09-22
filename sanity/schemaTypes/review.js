import { defineField, defineType } from "sanity";

export default defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "tenantType",
      title: "Tenant Type",
      type: "string",
      options: {
        list: [
          { title: "User", value: "user" },
          { title: "Company", value: "company" },
          { title: "Supplier", value: "supplier" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
      hidden: true,
    }),
    defineField({
      name: "tenantId",
      title: "Tenant ID",
      type: "string",
      description: "Unique identifier for the tenant this review belongs to.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      // Required for user reviews, hidden otherwise
      validation: (Rule) =>
        Rule.custom((val, context) => {
          const tenantType = context?.parent?.tenantType;
          if (tenantType !== "user") return true;
          if (!val) return "User is required for user reviews";
          return true;
        }),
      hidden: ({ parent }) => parent?.tenantType !== "user",
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "reference",
      to: [{ type: "company" }],
      // Only required when the review targets a company/supplier, not a user
      validation: (Rule) =>
        Rule.custom((val, context) => {
          const tenantType = context?.parent?.tenantType;
          if (tenantType === "user") return true;
          if (!val) return "Company is required for non-user reviews";
          return true;
        }),
      hidden: ({ parent }) => parent?.tenantType === "user",
    }),
    defineField({
      name: "companyTenantId",
      title: "Company Tenant ID (denormalized)",
      type: "string",
      description:
        "Optional: stored for user reviews when no company reference is used",
      hidden: ({ parent }) => parent?.tenantType !== "user",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "authorName",
      title: "Author Name",
      type: "string",
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "authorName" },
    prepare({ title, subtitle }) {
      return { title: title || "Untitled review", subtitle };
    },
  },
});
