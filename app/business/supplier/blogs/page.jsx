"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import BlogList from "@/app/business/_components/blogs/BlogList";
import BlogForm from "@/app/business/_components/blogs/BlogForm";
import {
  searchBlogs,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "@/services/sanity/blogs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SupplierBlogsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: null,
    tags: [],
    readingTime: "",
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  });

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }
    loadBlogs();
  }, [userId, router]);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      // TODO: Get supplier ID from user context
      const supplierId = "current-supplier-id"; // This should come from user context
      const blogData = await searchBlogs({
        authorType: "supplier",
        authorId: supplierId,
        status: "all", // Show all statuses for supplier's own blogs
      });
      setBlogs(blogData);
    } catch (error) {
      console.error("Error loading blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: null,
      tags: [],
      readingTime: "",
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
      },
    });
    setShowForm(true);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      slug: blog.slug?.current || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      featuredImage: blog.featuredImage || null,
      tags: blog.tags || [],
      readingTime: blog.readingTime?.toString() || "",
      seo: blog.seo || {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
      },
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const blogData = {
        ...formData,
        author: {
          authorType: "supplier",
          supplier: {
            _type: "reference",
            _ref: "current-supplier-id", // This should come from user context
          },
        },
        readingTime: formData.readingTime
          ? parseInt(formData.readingTime)
          : null,
        slug: {
          _type: "slug",
          current: formData.slug,
        },
      };

      if (editingBlog) {
        await updateBlogPost(editingBlog._id, blogData);
        toast.success("Blog post updated successfully");
      } else {
        await createBlogPost(blogData);
        toast.success("Blog post created successfully");
      }

      setShowForm(false);
      loadBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog post");
    }
  };

  const handleDelete = async (blog) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      await deleteBlogPost(blog._id);
      toast.success("Blog post deleted successfully");
      loadBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog post");
    }
  };

  const handleView = (blog) => {
    // TODO: Implement blog preview/view functionality
    console.log("View blog:", blog);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          <BlogList
            blogs={blogs}
            isLoading={isLoading}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onRefresh={loadBlogs}
            title="Supplier Blogs"
            emptyStateDescription="Start sharing your supplier expertise and service updates with your audience."
          />

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-lg sm:text-xl">
                  {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                </DialogTitle>
              </DialogHeader>
              <BlogForm
                {...formData}
                mode={editingBlog ? "edit" : "create"}
                onTitleChange={(title) =>
                  setFormData((prev) => ({ ...prev, title }))
                }
                onSlugChange={(slug) =>
                  setFormData((prev) => ({ ...prev, slug }))
                }
                onExcerptChange={(excerpt) =>
                  setFormData((prev) => ({ ...prev, excerpt }))
                }
                onContentChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                onFeaturedImageChange={(image) =>
                  setFormData((prev) => ({ ...prev, featuredImage: image }))
                }
                onTagsChange={(tags) =>
                  setFormData((prev) => ({ ...prev, tags }))
                }
                onReadingTimeChange={(time) =>
                  setFormData((prev) => ({ ...prev, readingTime: time }))
                }
                onSeoChange={(seo) => setFormData((prev) => ({ ...prev, seo }))}
                onSave={handleSave}
                onSubmitForReview={() => {
                  handleSave().then(() => {
                    if (editingBlog) {
                      handleSubmitForReview(editingBlog);
                    }
                  });
                }}
                status={editingBlog?.status || "draft"}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
