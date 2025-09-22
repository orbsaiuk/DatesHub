import { defineField, defineType } from "sanity";

export default defineType({
  name: "plan",
  title: "Subscription Plan",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Plan Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., Free, Pro, Premium, Enterprise",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
      description: "Brief description of what this plan offers",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "object",
      fields: [
        defineField({
          name: "amount",
          title: "Amount",
          type: "number",
          validation: (Rule) => Rule.required().min(0),
          description:
            "Price in standard currency units (e.g., dollars for USD, not cents)",
        }),
        defineField({
          name: "currency",
          title: "Currency",
          type: "string",
          options: {
            list: [
              { title: "USD", value: "usd" },
              { title: "EUR", value: "eur" },
              { title: "GBP", value: "gbp" },
            ],
          },
          initialValue: "usd",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "interval",
          title: "Billing Interval",
          type: "string",
          options: {
            list: [
              { title: "One-time", value: "one_time" },
              { title: "Monthly", value: "month" },
              { title: "Yearly", value: "year" },
            ],
          },
          initialValue: "month",
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Feature Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Feature Description",
              type: "text",
            }),
            defineField({
              name: "included",
              title: "Included",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "limit",
              title: "Limit",
              type: "number",
              description:
                "Set limit for this feature (e.g., 10 blog posts). Leave empty for unlimited.",
            }),
          ],
        },
      ],
      description: "List of features included in this plan",
    }),
    defineField({
      name: "limits",
      title: "Usage Limits",
      type: "object",
      fields: [
        defineField({
          name: "blogPosts",
          title: "Blog Posts Limit",
          type: "number",
          description: "Maximum number of blog posts. -1 for unlimited",
          initialValue: -1,
        }),
      ],
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
      description: "Whether this plan is available for new subscriptions",
    }),
    defineField({
      name: "isPopular",
      title: "Is Popular",
      type: "boolean",
      initialValue: false,
      description: "Mark this plan as popular/recommended",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
      description: "Order in which plans should be displayed",
    }),
    defineField({
      name: "stripeProductId",
      title: "Stripe Product ID",
      type: "string",
      description: "Stripe product ID for payment processing",
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
      description: "Stripe price ID for payment processing",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      amount: "price.amount",
      currency: "price.currency",
      interval: "price.interval",
    },
    prepare(selection) {
      const { title, subtitle, amount, currency, interval } = selection;
      const price = amount
        ? `${amount.toFixed(2)} ${currency?.toUpperCase()}`
        : "Free";
      const billing = interval === "one_time" ? "" : `/${interval}`;
      return {
        title,
        subtitle: `${price}${billing} - ${subtitle}`,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Price (Low to High)",
      name: "priceAsc",
      by: [{ field: "price.amount", direction: "asc" }],
    },
  ],
});
