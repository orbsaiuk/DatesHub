import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export default function BlogCard({ blog }) {
  if (!blog) return null;

  const imageUrl = blog.blogImage
    ? urlFor(blog.blogImage).width(1000).height(600).url()
    : null;

  const authorLogoUrl = blog.author?.company?.logo?.asset?.url
    ? urlFor(blog.author.company.logo).width(16).height(16).url()
    : blog.author?.supplier?.logo?.asset?.url
      ? urlFor(blog.author.supplier.logo).width(16).height(16).url()
      : null;

  let authorName =
    blog.author?.company?.name || blog.author?.supplier?.name || null;
  if (
    !authorName &&
    blog.author?.authorType === "company" &&
    blog.author?.companyRef
  ) {
    authorName = "شركة";
  } else if (
    !authorName &&
    blog.author?.authorType === "supplier" &&
    blog.author?.supplierRef
  ) {
    authorName = "مورّد";
  }

  return (
    <article className="group">
      <Link
        href={`/blogs/${blog._id}`}
        className="block h-full touch-manipulation"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
          <div className="aspect-[16/10] relative bg-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={blog.blogImage?.alt || blog.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-sm">لا توجد صورة</div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 flex-1 flex flex-col">
            <h3 className="capitalize text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
              {blog.title}
            </h3>

            {blog.excerpt && (
              <p className="capitalize text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-3 flex-1 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
              {(authorLogoUrl || authorName) && (
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {authorLogoUrl && (
                    <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={authorLogoUrl}
                        alt={authorName || "الكاتب"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  {authorName && (
                    <span className="truncate text-xs sm:text-sm">
                      {authorName}
                    </span>
                  )}
                </div>
              )}
            </div>

            <Button className="w-fit mt-3 sm:mt-4 border-gray-100 bg-button-1 hover:bg-button-1-hover text-white cursor-pointer flex items-center gap-2">
              المزيد اكتشف <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}
