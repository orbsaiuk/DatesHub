import { defineField, defineType } from "sanity";

export default defineType({
  name: "conversation",
  title: "Conversation",
  type: "document",
  fields: [
    defineField({
      name: "participant1",
      title: "First Participant",
      type: "reference",
      to: [{ type: "user" }, { type: "company" }, { type: "supplier" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "participant2",
      title: "Second Participant",
      type: "reference",
      to: [{ type: "user" }, { type: "company" }, { type: "supplier" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      participant1: "participant1.name",
      participant2: "participant2.name",
      createdAt: "createdAt",
    },
    prepare({ participant1, participant2, createdAt }) {
      const date = createdAt
        ? new Date(createdAt).toLocaleDateString()
        : "No date";
      return {
        title: `${participant1} - ${participant2}`,
        subtitle: `Created: ${date}`,
      };
    },
  },
  orderings: [
    {
      title: "Created Date, New",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Created Date, Old",
      name: "createdAtAsc",
      by: [{ field: "createdAt", direction: "asc" }],
    },
  ],
});
