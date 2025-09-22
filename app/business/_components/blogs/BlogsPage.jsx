import BlogsClient from "@/app/business/_components/blogs/BlogsClient";

export default function BlogsPage({ tenantType, tenantId, items }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Blogs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage your blog posts
          </p>
        </div>
      </div>

      <BlogsClient
        tenantType={tenantType}
        tenantId={tenantId}
        items={items}
        onChanged={undefined}
      />
    </div>
  );
}
