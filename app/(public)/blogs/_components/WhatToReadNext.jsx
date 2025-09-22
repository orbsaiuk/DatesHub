import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

export default function WhatToReadNext({ blogs }) {
  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-first responsive title */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 lg:mb-12 text-center leading-tight">
          What to Read Next
        </h2>

        {/* Mobile-first responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {blogs.slice(0, 2).map((blog) => (
            <article key={blog._id} className="group">
              <Link
                href={`/blogs/${blog.slug.current}`}
                className="block h-full"
              >
                <div className="h-full flex flex-col">
                  {/* Image with responsive aspect ratio */}
                  {blog.blogImage?.asset?.url && (
                    <div className="aspect-[16/10] sm:aspect-[16/9] relative bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4 shadow-sm">
                      <Image
                        src={urlFor(blog.blogImage)
                          .width(600)
                          .height(400)
                          .url()}
                        alt={blog.blogImage?.alt || blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  )}

                  {/* Content with flex-grow for equal height cards */}
                  <div className="space-y-2 sm:space-y-3 flex-grow flex flex-col">
                    {/* Title with responsive typography */}
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight flex-grow">
                      {blog.title}
                    </h3>

                    {/* Excerpt with responsive text size */}
                    {blog.excerpt && (
                      <p className="text-gray-600 text-sm sm:text-base line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    )}

                    {/* Meta information with responsive layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-500 pt-2">
                      {blog.author && (
                        <div className="flex items-center space-x-2">
                          {blog.author.company?.logo?.asset?.url && (
                            <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={urlFor(blog.author.company.logo)
                                  .width(16)
                                  .height(16)
                                  .url()}
                                alt={
                                  blog.author.company?.name || "Company logo"
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          {blog.author.supplier?.logo?.asset?.url && (
                            <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={urlFor(blog.author.supplier.logo)
                                  .width(16)
                                  .height(16)
                                  .url()}
                                alt={
                                  blog.author.supplier?.name || "Supplier logo"
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span className="truncate">
                            {blog.author.company?.name ||
                              blog.author.supplier?.name}
                          </span>
                        </div>
                      )}

                      {blog.readingTime && (
                        <span className="flex-shrink-0">
                          {blog.readingTime} min read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
