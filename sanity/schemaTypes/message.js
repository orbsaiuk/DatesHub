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
        defineField({ name: "tenantId", title: "Tenant ID", type: "string" }),
      ],
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "messageType",
      title: "Message Type",
      type: "string",
      options: {
        list: [
          { title: "Regular Message", value: "text" },
          { title: "Event Request", value: "event_request" },
        ],
      },
      initialValue: "text",
    }),
    defineField({
      name: "eventRequestData",
      title: "Event Request Data",
      type: "object",
      hidden: ({ parent }) => parent?.messageType !== "event_request",
      fields: [
        defineField({
          name: "eventRequestId",
          title: "Event Request ID",
          type: "string",
        }),
        defineField({
          name: "fullName",
          title: "Client Full Name",
          type: "string",
        }),
        defineField({
          name: "eventDate",
          title: "Event Date",
          type: "date",
        }),
        defineField({
          name: "eventTime",
          title: "Event Time",
          type: "string",
        }),
        defineField({
          name: "numberOfGuests",
          title: "Number of Guests",
          type: "string",
        }),
        defineField({
          name: "category",
          title: "Service Category",
          type: "string",
        }),
        defineField({
          name: "serviceRequired",
          title: "Service Required",
          type: "string",
        }),
        defineField({
          name: "eventLocation",
          title: "Event Location",
          type: "string",
        }),
        defineField({
          name: "eventDescription",
          title: "Event Description",
          type: "text",
        }),
        defineField({
          name: "status",
          title: "Status",
          type: "string",
          options: {
            list: [
              { title: "Pending", value: "pending" },
              { title: "Accepted", value: "accepted" },
              { title: "Declined", value: "declined" },
            ],
          },
          initialValue: "pending",
        }),
        defineField({
          name: "companyResponse",
          title: "Company Response",
          type: "text",
        }),
      ],
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
      title: "text",
      subtitle: "createdAt",
    },
  },
});
