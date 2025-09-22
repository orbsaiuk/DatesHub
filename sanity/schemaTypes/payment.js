import { defineField, defineType } from "sanity";

export default defineType({
  name: "payment",
  title: "Payment",
  type: "document",
  fields: [
    defineField({
      name: "subscription",
      title: "Subscription",
      type: "reference",
      to: [{ type: "subscription" }],
      validation: (Rule) => Rule.required(),
    }),
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
    }),
    defineField({
      name: "amount",
      title: "Amount",
      type: "object",
      fields: [
        defineField({
          name: "total",
          title: "Total Amount",
          type: "number",
          validation: (Rule) => Rule.required().min(0),
          description:
            "Total amount in standard currency units (e.g., dollars, not cents)",
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
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "tax",
          title: "Tax Amount",
          type: "number",
          initialValue: 0,
          description: "Tax amount in standard currency units",
        }),
        defineField({
          name: "discount",
          title: "Discount Amount",
          type: "number",
          initialValue: 0,
          description: "Discount amount in standard currency units",
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Succeeded", value: "succeeded" },
          { title: "Failed", value: "failed" },
          { title: "Canceled", value: "canceled" },
          { title: "Refunded", value: "refunded" },
          { title: "Partially Refunded", value: "partially_refunded" },
        ],
        layout: "dropdown",
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "object",
      fields: [
        defineField({
          name: "type",
          title: "Type",
          type: "string",
          options: {
            list: [
              { title: "Credit Card", value: "card" },
              { title: "Bank Transfer", value: "bank_transfer" },
              { title: "PayPal", value: "paypal" },
              { title: "Other", value: "other" },
            ],
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "last4",
          title: "Last 4 Digits",
          type: "string",
          description: "Last 4 digits of card (if applicable)",
        }),
        defineField({
          name: "brand",
          title: "Card Brand",
          type: "string",
          description: "Card brand (e.g., Visa, Mastercard)",
        }),
      ],
    }),
    defineField({
      name: "transactionDate",
      title: "Transaction Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      description: "When the payment was processed",
    }),
    defineField({
      name: "periodCovered",
      title: "Period Covered",
      type: "object",
      fields: [
        defineField({
          name: "start",
          title: "Period Start",
          type: "datetime",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "end",
          title: "Period End",
          type: "datetime",
          validation: (Rule) => Rule.required(),
        }),
      ],
      description: "The subscription period this payment covers",
    }),
    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe Payment Intent ID",
      type: "string",
      description: "Stripe payment intent ID",
    }),
    defineField({
      name: "stripeChargeId",
      title: "Stripe Charge ID",
      type: "string",
      description: "Stripe charge ID",
    }),
    defineField({
      name: "invoice",
      title: "Invoice",
      type: "object",
      fields: [
        defineField({
          name: "number",
          title: "Invoice Number",
          type: "string",
        }),
        defineField({
          name: "url",
          title: "Invoice URL",
          type: "url",
          description: "Link to the invoice PDF",
        }),
      ],
    }),
    defineField({
      name: "refund",
      title: "Refund Information",
      type: "object",
      fields: [
        defineField({
          name: "amount",
          title: "Refund Amount",
          type: "number",
          description: "Refunded amount in standard currency units",
        }),
        defineField({
          name: "reason",
          title: "Refund Reason",
          type: "string",
          options: {
            list: [
              { title: "Customer Request", value: "customer_request" },
              { title: "Duplicate Payment", value: "duplicate" },
              { title: "Service Issue", value: "service_issue" },
              { title: "Fraudulent", value: "fraudulent" },
              { title: "Other", value: "other" },
            ],
          },
        }),
        defineField({
          name: "processedAt",
          title: "Refund Processed At",
          type: "datetime",
        }),
      ],
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      description: "Internal notes about this payment",
    }),
  ],
  preview: {
    select: {
      amount: "amount.total",
      currency: "amount.currency",
      status: "status",
      transactionDate: "transactionDate",
      tenantId: "tenantId",
      tenantType: "tenantType",
    },
    prepare(selection) {
      const {
        amount,
        currency,
        status,
        transactionDate,
        tenantId,
        tenantType,
      } = selection;
      const formattedAmount = amount
        ? `${amount.toFixed(2)} ${currency?.toUpperCase()}`
        : "N/A";
      const date = transactionDate
        ? new Date(transactionDate).toLocaleDateString()
        : "";
      return {
        title: `${formattedAmount} - ${status}`,
        subtitle: `${tenantType} ${tenantId} | ${date}`,
      };
    },
  },
  orderings: [
    {
      title: "Transaction Date (Newest)",
      name: "transactionDateDesc",
      by: [{ field: "transactionDate", direction: "desc" }],
    },
    {
      title: "Amount (High to Low)",
      name: "amountDesc",
      by: [{ field: "amount.total", direction: "desc" }],
    },
    {
      title: "Status",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
  ],
});
