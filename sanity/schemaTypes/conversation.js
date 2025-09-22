import { defineField, defineType } from "sanity";

export default defineType({
  name: "conversation",
  title: "Conversation",
  type: "document",
  fields: [
    defineField({
      name: "conversationType",
      title: "Conversation Type",
      type: "string",
      validation: (Rule) =>
        Rule.required().valid("user-company", "company-supplier"),
    }),
    defineField({
      name: "participants",
      title: "Participants",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "kind",
              title: "Kind",
              type: "string",
              validation: (Rule) =>
                Rule.required().valid("user", "company", "supplier"),
            }),
            defineField({
              name: "clerkId",
              title: "Clerk User ID",
              type: "string",
            }),
            defineField({
              name: "tenantId",
              title: "Tenant ID",
              type: "string",
            }),
            defineField({
              name: "userRef",
              title: "User",
              type: "reference",
              to: [{ type: "user" }],
            }),
            defineField({
              name: "companyRef",
              title: "Company",
              type: "reference",
              to: [{ type: "company" }],
            }),
            defineField({
              name: "supplierRef",
              title: "Supplier",
              type: "reference",
              to: [{ type: "supplier" }],
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(2).max(2),
    }),
    defineField({
      name: "compositeKey",
      title: "Composite Key",
      type: "string",
      description:
        "Deterministic key like user:<id>|company:<tenantId> or company:<a>|supplier:<b>",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastMessageAt",
      title: "Last Message At",
      type: "datetime",
    }),
    defineField({
      name: "lastMessagePreview",
      title: "Last Message Preview",
      type: "string",
    }),
    defineField({
      name: "unread",
      title: "Unread Counters",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "participantKey",
              title: "Participant Key",
              type: "string",
            }),
            defineField({ name: "count", title: "Count", type: "number" }),
            defineField({
              name: "updatedAt",
              title: "Updated At",
              type: "datetime",
            }),
          ],
        },
      ],
    }),
    // Optional tenant scoping for business inbox filtering
    defineField({ name: "tenantType", title: "Tenant Type", type: "string" }),
    defineField({ name: "tenantId", title: "Tenant ID", type: "string" }),
    defineField({ name: "closed", title: "Closed", type: "boolean" }),
    defineField({
      name: "closedReason",
      title: "Closed Reason",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "conversationType",
      subtitle: "compositeKey",
    },
  },
});
