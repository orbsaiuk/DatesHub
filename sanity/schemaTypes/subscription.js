import { defineField, defineType } from "sanity";

export default defineType({
  name: "subscription",
  title: "Subscription",
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
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tenantId",
      title: "Tenant ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "The tenant ID of the company or supplier",
    }),
    defineField({
      name: "tenantName",
      title: "Tenant Name",
      type: "string",
      description: "Denormalized display name of the tenant (company/supplier)",
    }),
    defineField({
      name: "tenant",
      title: "Tenant Reference",
      type: "reference",
      to: [{ type: "company" }, { type: "supplier" }],
      validation: (Rule) => Rule.required(),
      description: "Reference to the company or supplier",
    }),
    defineField({
      name: "plan",
      title: "Subscription Plan",
      type: "reference",
      to: [{ type: "plan" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Canceled", value: "canceled" },
          { title: "Past Due", value: "past_due" },
          { title: "Unpaid", value: "unpaid" },
          { title: "Trialing", value: "trialing" },
          { title: "Incomplete", value: "incomplete" },
          { title: "Incomplete Expired", value: "incomplete_expired" },
        ],
        layout: "dropdown",
      },
      initialValue: "active",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      description: "When the subscription started",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
      description: "When the subscription ends",
    }),

    defineField({
      name: "usage",
      title: "Current Usage",
      type: "object",
      fields: [
        defineField({
          name: "blogPosts",
          title: "Blog Posts Used",
          type: "number",
          initialValue: 0,
        }),
      ],

      description: "Current usage statistics",
    }),
    defineField({
      name: "stripeSubscriptionId",
      title: "Stripe Subscription ID",
      type: "string",
      description: "Stripe subscription ID for payment processing",
    }),
    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      description: "Stripe customer ID",
    }),
  ],
  preview: {
    select: {
      tenantType: "tenantType",
      tenantName: "tenantName",
      planName: "plan.name",
      status: "status",
      startDate: "startDate",
    },
    prepare(selection) {
      const { tenantType, tenantName, planName, status, startDate } = selection;
      const date = startDate ? new Date(startDate).toLocaleDateString() : "";
      const displayTenant = `${tenantName}'s ${tenantType} - ${planName}`;
      return {
        title: `${displayTenant}`,
        subtitle: `Status: ${status} | Started: ${date}`,
      };
    },
  },
  orderings: [
    {
      title: "Start Date (Newest)",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
    {
      title: "Status",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
  ],
});
