import { notFound } from "next/navigation";
import Image from "next/image";
import { getBlogBySlug, getRecentBlogs } from "@/services/sanity/blogs";
import Blog from "@/components/sections/Blog";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug);
  if (!blog) return {};
  const imageUrl = blog?.blogImage?.asset?.url;
  return {
    title: blog?.seo?.title || blog?.title,
    description: blog?.seo?.description || blog?.excerpt,
    alternates: { canonical: `/blogs/${resolvedParams.slug}` },
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
  const blog = await getBlogBySlug(resolvedParams.slug);
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

          {/* Excerpt - Better mobile typography */}
          {blog?.excerpt && (
            <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed capitalize">
              {blog.excerpt}
            </p>
          )}

          {/* Content - Enhanced prose styling for mobile */}
          {blog?.contentHtml && (
            <div
              className="prose prose-neutral prose-sm sm:prose-base lg:prose-lg max-w-none 
                         prose-headings:font-bold prose-headings:tracking-tight
                         prose-h1:text-xl prose-h1:sm:text-2xl prose-h1:lg:text-3xl
                         prose-h2:text-lg prose-h2:sm:text-xl prose-h2:lg:text-2xl
                         prose-h3:text-base prose-h3:sm:text-lg prose-h3:lg:text-xl
                         prose-p:leading-relaxed prose-p:mb-4 sm:prose-p:mb-6
                         prose-img:rounded-lg prose-img:shadow-sm prose-img:w-full
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg
                         prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                         prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
                         prose-ul:pl-4 sm:prose-ul:pl-6 prose-ol:pl-4 sm:prose-ol:pl-6
                         prose-li:mb-2"
              dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
            />
          )}
        </article>

        {/* What to Read Next Section */}
        {relatedBlogs.length > 0 && (
          <div className="border-t bg-muted/30">
            <Blog items={relatedBlogs} title="What to read next" />
          </div>
        )}
      </main>
    </div>
  );
}
