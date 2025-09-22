import { defineField, defineType } from "sanity";

export default defineType({
  name: "blog",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      description: "Brief description of the blog post (for previews)",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "contentHtml",
      title: "Content",
      type: "text",
      description: "Rich HTML content from Quill editor",
      validation: (Rule) => Rule.required(),
      components: {
        input: (props) => {
          const { value } = props;
          const html =
            value || '<p style="color: #9CA3AF;">No content yet...</p>';
          return (
            <div>
              <div
                style={{
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Content Preview:
              </div>
              <div
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#FFFFFF",
                }}
              >
                {/* Inline styles to mimic blog page typography */}
                <div style={{ padding: 24 }}>
                  <style>{`
                    .blog-content { color: #111827; line-height: 1.75; }
                    .blog-content h1 { font-size: 2rem; line-height: 1.25; font-weight: 800; margin: 1.5rem 0 1rem; }
                    .blog-content h2 { font-size: 1.5rem; line-height: 1.3; font-weight: 700; margin: 1.25rem 0 0.75rem; }
                    .blog-content h3 { font-size: 1.25rem; line-height: 1.35; font-weight: 700; margin: 1rem 0 0.5rem; }
                    .blog-content p { margin: 0.75rem 0; }
                    .blog-content a { color: #2563EB; text-decoration: underline; }
                    .blog-content img, .blog-content video, .blog-content iframe { max-width: 100%; height: auto; border-radius: 8px; }
                    .blog-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
                    .blog-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
                    .blog-content li { margin: 0.375rem 0; }
                    .blog-content blockquote { border-left: 4px solid #E5E7EB; margin: 1rem 0; padding: 0.5rem 1rem; color: #374151; background: #F9FAFB; border-radius: 0 8px 8px 0; }
                    .blog-content hr { border: none; border-top: 1px solid #E5E7EB; margin: 1.5rem 0; }
                    .blog-content pre { background: #0B1020; color: #E5E7EB; padding: 1rem; border-radius: 8px; overflow: auto; font-size: 0.9rem; }
                    .blog-content code { background: #F3F4F6; color: #111827; padding: 0.15rem 0.35rem; border-radius: 4px; }
                    /* Common Quill classes */
                    .blog-content .ql-align-center { text-align: center; }
                    .blog-content .ql-align-right { text-align: right; }
                    .blog-content .ql-align-justify { text-align: justify; }
                    .blog-content .ql-indent-1 { padding-left: 1.5rem; }
                    .blog-content .ql-indent-2 { padding-left: 3rem; }
                    .blog-content .ql-indent-3 { padding-left: 4.5rem; }
                    .blog-content .ql-size-small { font-size: 0.875rem; }
                    .blog-content .ql-size-large { font-size: 1.25rem; }
                    .blog-content .ql-size-huge { font-size: 1.5rem; }
                  `}</style>
                  <article
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            </div>
          );
        },
      },
    }),
    defineField({
      name: "contentText",
      title: "Content (Text Only)",
      type: "text",
      description: "Plain text version - auto-generated",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "blogImage",
      title: "Blog Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "object",
      fields: [
        defineField({
          name: "authorType",
          title: "Author Type",
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
          name: "supplier",
          title: "Supplier",
          type: "reference",
          to: [{ type: "supplier" }],
          hidden: ({ parent }) => parent?.authorType !== "supplier",
          validation: (Rule) =>
            Rule.custom((supplier, context) => {
              const authorType = context.parent?.authorType;
              if (authorType === "supplier" && !supplier) {
                return "Supplier is required when author type is Supplier";
              }
              return true;
            }),
        }),
        defineField({
          name: "company",
          title: "Company",
          type: "reference",
          to: [{ type: "company" }],
          hidden: ({ parent }) => parent?.authorType !== "company",
          validation: (Rule) =>
            Rule.custom((company, context) => {
              const authorType = context.parent?.authorType;
              if (authorType === "company" && !company) {
                return "Company is required when author type is Company";
              }
              return true;
            }),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Select a category for this blog post",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Publication Status",
      type: "string",
      options: {
        list: [
          { title: "Pending Review", value: "pending" },
          { title: "Published", value: "published" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      description: "When this blog post was created",
    }),
    defineField({
      name: "reviewNotes",
      title: "Review Notes",
      type: "text",
      description: "Internal notes from the review process",
      readOnly: ({ document }) => document?.status === "published",
    }),
    defineField({
      name: "views",
      title: "View Count",
      type: "number",
      readOnly: true,
      initialValue: 0,
      description: "Total number of views for this blog post",
    }),
    defineField({
      name: "featured",
      title: "Featured Post",
      type: "boolean",
      description: "Mark this post as featured to highlight it",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "blogImage",
      status: "status",
      authorType: "author.authorType",
      companyName: "author.company.name",
      supplierName: "author.supplier.name",
    },
    prepare(selection) {
      const { title, media, status, authorType, companyName, supplierName } =
        selection;
      const authorName = authorType === "company" ? companyName : supplierName;
      const statusLabel = status ? `Status: ${status}` : "";
      const authorLabel = authorName
        ? ` | By: ${authorName}`
        : ` | Author: ${authorType || "Unknown"}`;

      return {
        title,
        media,
        subtitle: `${statusLabel}${authorLabel}`,
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
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
    {
      title: "Status",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
  ],
});
