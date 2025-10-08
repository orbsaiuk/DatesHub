import { defineField, defineType } from "sanity";

export default defineType({
  name: "message",
  title: "Message",
  type: "document",
  fields: [
    defineField({
      name: "conversation",
      title: "Conversation",
      type: "reference",
      to: [{ type: "conversation" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sender",
      title: "Sender",
      type: "reference",
      to: [{ type: "user" }, { type: "company" }, { type: "supplier" }],
      description: "The participant who sent this message",
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      validation: (Rule) => Rule.required(),
      hidden: ({ parent }) => parent?.messageType !== "text",
    }),
    defineField({
      name: "messageType",
      title: "Message Type",
      type: "string",
      options: {
        list: [
          { title: "Regular Message", value: "text" },
          { title: "Order Request", value: "order_request" },
        ],
      },
      initialValue: "text",
    }),

    defineField({
      name: "orderRequest",
      title: "Order Request",
      type: "reference",
      to: [{ type: "orderRequest" }],
      description: "Reference to the full order request document",
      hidden: ({ parent }) => parent?.messageType !== "order_request",
    }),

    defineField({ name: "createdAt", title: "Created At", type: "datetime" }),
    defineField({
      name: "readBy",
      title: "Read By",
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
            defineField({ name: "readAt", title: "Read At", type: "datetime" }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      text: "text",
      messageType: "messageType",
      createdAt: "createdAt",
      orderRequestTitle: "orderRequest.title",
    },
    prepare({ text, messageType, createdAt, orderRequestTitle }) {
      const date = createdAt
        ? new Date(createdAt).toLocaleDateString()
        : "No date";

      let title = text || "Message";

      if (messageType === "order_request") {
        title = "طلب جديد";
      }

      return {
        title: title,
        subtitle: `${date}`,
      };
    },
  },
});
