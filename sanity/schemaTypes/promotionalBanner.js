import { defineField, defineType } from "sanity";

export default defineType({
  name: "promotionalBanner",
  title: "Promotional Banners",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.optional().max(100),
      description: "Main headline for the promotional banner (optional)",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "string",
      validation: (Rule) => Rule.optional().max(200),
      description: "Optional subtitle or tagline",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) => Rule.optional(),
      description: "Detailed description of the promotion (optional)",
    }),
    defineField({
      name: "image",
      title: "Banner Image",
      type: "image",
      options: {
        hotspot: true,
        metadata: ["blurhash", "lqip", "palette"],
      },
      validation: (Rule) => Rule.required(),
      description: "High-quality banner image (recommended: 1200x600px)",
    }),
    defineField({
      name: "ctaText",
      title: "Call to Action Text",
      type: "string",
      validation: (Rule) => Rule.optional().max(50),
      description: "Text for the action button (optional)",
    }),
    defineField({
      name: "ctaLink",
      title: "Call to Action Link",
      type: "url",
      validation: (Rule) =>
        Rule.optional().uri({
          allowRelative: true,
          scheme: ["http", "https", "mailto", "tel"],
        }),
      description: "Where the CTA button should link to (optional)",
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
      description: "Whether this banner should be displayed",
    }),
    defineField({
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
      description: "Order in which banners appear (0 = first)",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      description: "When this banner should start showing (optional)",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
      description: "When this banner should stop showing (optional)",
    }),
    defineField({
      name: "showEndDate",
      title: "Show End Date",
      type: "boolean",
      initialValue: true,
      description:
        "Whether to display the end date to users (only works if endDate is provided)",
      hidden: ({ parent }) => !parent?.endDate,
    }),
    defineField({
      name: "targetAudience",
      title: "Target Audience",
      type: "string",
      options: {
        list: [
          {
            title: "All Users",
            value: "all",
            description:
              "Shown to everyone: regular users, companies, and non-logged visitors",
          },
          {
            title: "Companies Target",
            value: "companies",
            description:
              "Shown to regular users and non-logged visitors to attract companies to join",
          },
          {
            title: "Suppliers Target",
            value: "suppliers",
            description: "Shown to companies to attract suppliers to join",
          },
        ],
        layout: "radio",
      },
      initialValue: "all",
      description:
        "Choose who should see this banner: 'All' = everyone (including non-logged users), 'Companies' = shown to regular/non-logged users (to attract companies), 'Suppliers' = shown to companies (to attract suppliers)",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "targetAudience",
      media: "image",
      isActive: "isActive",
    },
    prepare({ title, subtitle, media, isActive }) {
      const audienceLabels = {
        all: "All Users",
        companies: "Companies Target",
        suppliers: "Suppliers Target",
      };
      return {
        title: title,
        subtitle: `${audienceLabels[subtitle] || subtitle} ${isActive ? "(Active)" : "(Inactive)"}`,
        media: media,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "displayOrder",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
    {
      title: "Created Date",
      name: "createdAt",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
