const user = {
  name: "user",
  title: "User",
  type: "document",
  fields: [
    {
      name: "clerkId",
      title: "Clerk ID",
      type: "string",
      description: "The Clerk user ID for this profile",
    },
    {
      name: "email",
      title: "Email",
      type: "string",
    },
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "imageUrl",
      title: "Image URL",
      type: "url",
    },
    {
      name: "role",
      title: "Role",
      type: "string",
      description: "Mirrored from Clerk public metadata",
      readOnly: true,
    },
    {
      name: "memberships",
      title: "Tenant Memberships",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "tenantType",
              title: "Tenant Type",
              type: "string",
              options: {
                list: [
                  { title: "Company", value: "company" },
                  { title: "Supplier", value: "supplier" },
                ],
              },
            },
            { name: "tenantId", title: "Tenant ID", type: "string" },
            {
              name: "role",
              title: "Role",
              type: "string",
              options: {
                list: [
                  { title: "Owner", value: "owner" },
                  { title: "Manager", value: "manager" },
                  { title: "Member", value: "member" },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      name: "rating",
      title: "Average Rating",
      type: "number",
      readOnly: true,
      description: "Average rating given by companies. Optional cache.",
    },
    {
      name: "ratingCount",
      title: "Rating Count",
      type: "number",
      readOnly: true,
      description: "Number of ratings received by the user.",
    },
    {
      name: "bookmarks",
      title: "Bookmarks",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "company" }],
          weak: true,
        },
      ],
    },
  ],
};

export default user;
