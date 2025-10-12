import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "heroTitle", title: "Hero Title", type: "string" }),
    defineField({
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
    }),
    defineField({
      name: "companyHeroTitle",
      title: "Company Hero Title",
      type: "string",
    }),
    defineField({
      name: "companyHeroDescription",
      title: "Company Hero Description",
      type: "text",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      fields: [
        { name: "email", title: "Email", type: "string" },
        { name: "phone", title: "Phone", type: "string" },
        { name: "address", title: "Address", type: "text" },
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        { name: "facebook", title: "Facebook", type: "url" },
        { name: "twitter", title: "Twitter/X", type: "url" },
        { name: "instagram", title: "Instagram", type: "url" },
        { name: "linkedin", title: "LinkedIn", type: "url" },
        { name: "youtube", title: "YouTube", type: "url" },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "metaTitle", title: "Meta Title", type: "string" },
        { name: "metaDescription", title: "Meta Description", type: "text" },
        {
          name: "ogImage",
          title: "Open Graph Image",
          type: "image",
          options: { hotspot: true },
        },
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            { name: "q", title: "Question", type: "string" },
            { name: "a", title: "Answer", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "how",
      title: "How It Works",
      type: "array",
      of: [
        {
          type: "object",
          name: "howStep",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "companyHow",
      title: "How It Works (Company)",
      type: "array",
      of: [
        {
          type: "object",
          name: "companyHowStep",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "why",
      title: "Why Choose Us",
      type: "array",
      validation: (Rule) => Rule.required().min(3).max(3),
      of: [
        {
          type: "object",
          name: "whyFeature",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "companyWhy",
      title: "Why Choose Us (Company)",
      type: "array",
      validation: (Rule) => Rule.required().min(3).max(3),
      of: [
        {
          type: "object",
          name: "companyWhyFeature",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Description", type: "text" },
          ],
        },
      ],
    }),
    defineField({ name: "footerText", title: "Footer Text", type: "text" }),
  ],
  preview: {
    select: { title: "title", media: "logo" },
    prepare({ title, media }) {
      return { title: title || "Site Settings", media };
    },
  },
});
