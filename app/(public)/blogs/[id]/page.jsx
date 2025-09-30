import { notFound } from "next/navigation";
import Image from "next/image";
import { getBlogById, getRecentBlogs } from "@/services/sanity/blogs";
import Blog from "@/components/sections/Blog";
import { formatContentForDisplay } from "@/lib/contentUtils";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const blog = await getBlogById(resolvedParams.id);
  if (!blog) return {};
  const imageUrl = blog?.blogImage?.asset?.url;
  return {
    title: blog?.seo?.title || blog?.title,
    description: blog?.seo?.description || blog?.excerpt,
    alternates: { canonical: `/blogs/${resolvedParams.id}` },
    openGraph: {
      title: blog?.seo?.title || blog?.title,
      description: blog?.seo?.description || blog?.excerpt,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const blog = await getBlogById(resolvedParams.id);
  if (!blog) return notFound();

  // Get recent blogs for "What to Read Next"
  const recentBlogs = await getRecentBlogs(3);
  const relatedBlogs = recentBlogs.filter(
    (recentBlog) => recentBlog._id !== blog._id
  );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Title - Mobile-first responsive typography */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight sm:leading-tight lg:leading-tight capitalize">
            {blog.title}
          </h1>

          {blog?.excerpt && (
            <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed capitalize">
              {blog.excerpt}
            </p>
          )}

          {/* Featured Image - Responsive with proper aspect ratios */}
          {blog?.blogImage?.asset?.url && (
            <div className="mb-6 sm:mb-8">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] rounded-lg sm:rounded-xl overflow-hidden border shadow-sm">
                <Image
                  src={blog.blogImage.asset.url}
                  alt={blog.blogImage.alt || blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  priority
                />
              </div>
            </div>
          )}

          {/* Content - Enhanced prose styling for mobile */}
          {blog?.contentHtml && (
            <div
              className="prose prose-blue max-w-none text-gray-800"
              dangerouslySetInnerHTML={{
                __html: formatContentForDisplay(blog.contentHtml),
              }}
            />
          )}
        </article>

        {/* What to Read Next Section */}
        {relatedBlogs.length > 0 && (
          <div className="border-t bg-muted/30">
            <Blog items={relatedBlogs} title="ماذا تقرأ بعد ذلك" />
          </div>
        )}
      </main>
    </div>
  );
}
