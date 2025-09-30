import BlogCard from "@/components/blog/BlogCard";

export default function BlogGrid({ blogs = [] }) {
  if (!blogs || blogs.length === 0) {
    return (
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-2">
              لا توجد مقالات
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              حاول تعديل معايير البحث أو التصفية.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  );
}
