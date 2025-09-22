"use client";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BlogForm from "@/app/business/_components/blogs/BlogForm";
import BlogPreview from "@/app/business/_components/blogs/BlogPreview";
import BlogSearchFilters from "@/app/business/_components/blogs/BlogSearchFilters";
import BlogCardView from "@/app/business/_components/blogs/BlogCardView";
import BlogPagination from "@/app/business/_components/blogs/BlogPagination";
import BlogEmptyState from "@/app/business/_components/blogs/BlogEmptyState";
import AddBlogDialog from "@/app/business/_components/blogs/AddBlogDialog";

export default function BlogsClient({
  tenantType,
  tenantId,
  items,
  onChanged,
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [showForm, setShowForm] = useState(false);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [localItems, setLocalItems] = useState(items || []);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState({ id: null, type: null });
  const [creatingCount, setCreatingCount] = useState(0);

  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  const stats = useMemo(() => {
    const total = localItems.length;
    const pending = localItems.filter((x) => x.status === "pending").length;
    const published = localItems.filter((x) => x.status === "published").length;
    const rejected = localItems.filter((x) => x.status === "rejected").length;
    return { total, pending, published, rejected };
  }, [localItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localItems.filter((b) => {
      const matchesQ =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        (Array.isArray(b.tags) &&
          b.tags.some((t) => t?.toLowerCase().includes(q)));
      const matchesStatus = status === "all" || b.status === status;
      const matchesCategory =
        category === "all" ||
        b.category?._ref === category ||
        b.category?._id === category;
      return matchesQ && matchesStatus && matchesCategory;
    });
  }, [localItems, query, status, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const openCreate = () => {
    setShowForm(true);
  };

  const openPreview = (blog) => {
    setPreviewBlog(blog);
    setTimeout(() => setShowPreview(true), 0);
  };

  async function handleDelete(blog) {
    const id = blog._id;
    const blogTitle = blog.title || "blog post";

    if (pending.id) return;
    setPending({ id, type: "delete" });

    try {
      const res = await fetch("/api/blogs/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.status === 404) {
        toast.success(`"${blogTitle}" was already deleted`, {
          id: `delete-${id}`,
        });
        setLocalItems((prev) => prev.filter((b) => b._id !== id));
        if (onChanged) onChanged();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete blog");
      }

      toast.success(`"${blogTitle}" deleted successfully`, {
        id: `delete-${id}`,
      });
      setLocalItems((prev) => prev.filter((b) => b._id !== id));
      if (onChanged) onChanged();
    } catch (e) {
      const errorMsg = e.message || "Failed to delete blog";
      toast.error(`Failed to delete "${blogTitle}"`, {
        id: `delete-${id}`,
        description: errorMsg,
        duration: 6000,
        action: {
          label: "Try again",
          onClick: () => handleDelete(blog),
        },
      });
    } finally {
      setPending({ id: null, type: null });
    }
  }

  async function handleSave(form) {
    try {
      setSaving(true);
      const isFile = form.blogImage instanceof File;
      const baseJson = {
        tenantType,
        tenantId,
        title: form.title || "",
        excerpt: form.excerpt || "",
        contentHtml:
          typeof form.content === "string"
            ? form.content
            : form.content?.html || "",
        contentText:
          typeof form.content === "string"
            ? form.content
            : form.content?.plainText || "",
        blogImage: isFile ? undefined : form.blogImage || null,
        tags: Array.isArray(form.tags) ? form.tags : [],
        readingTime: form.readingTime ? Number(form.readingTime) : null,
      };

      let res;
      setShowForm(false);
      setCreatingCount((c) => c + 1);
      if (isFile) {
        const formData = new FormData();
        formData.append("json", JSON.stringify(baseJson));
        formData.append("file", form.blogImage);
        res = await fetch("/api/blogs/create", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/blogs/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(baseJson),
        });
      }
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create blog");

      toast.success("Blog post created");
      setLocalItems((prev) => [result.blog, ...prev]);
      setCreatingCount((c) => Math.max(0, c - 1));
      if (onChanged) onChanged();
      return result.blog;
    } catch (e) {
      toast.error(e?.message || "Failed to save blog");
      setCreatingCount((c) => Math.max(0, c - 1));
    } finally {
      setSaving(false);
    }
  }

  const initialValues = {
    title: "",
    excerpt: "",
    content: "",
    blogImage: null,
    tags: [],
    readingTime: "",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2 :text-sm">
          <Badge variant="outline">Total: {stats.total}</Badge>
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Pending: {stats.pending}
          </Badge>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Published: {stats.published}
          </Badge>
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Rejected: {stats.rejected}
          </Badge>
        </div>
        <AddBlogDialog
          tenantType={tenantType}
          tenantId={tenantId}
          triggerClassName="inline-flex items-center justify-center cursor-pointer h-11 px-4 text-sm sm:h-10 sm:px-3"
          onCreated={(blog) => {
            setPage(1);
            if (onChanged) onChanged();
          }}
        />
      </div>
      <BlogSearchFilters
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
      />

      {filtered.length === 0 ? (
        creatingCount > 0 ? (
          <BlogCardView
            pageItems={[]}
            pending={pending}
            onPreview={openPreview}
            onView={null}
            onDelete={handleDelete}
            createSkeletonCount={creatingCount}
          />
        ) : (
          <BlogEmptyState
            query={query}
            onCreate={openCreate}
            onClearQuery={() => setQuery("")}
          />
        )
      ) : (
        <>
          <BlogCardView
            pageItems={pageItems}
            pending={pending}
            onPreview={openPreview}
            onView={null}
            onDelete={handleDelete}
            createSkeletonCount={creatingCount}
          />
        </>
      )}

      <BlogPagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setPage}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">
              Create New Blog Post
            </DialogTitle>
          </DialogHeader>
          <BlogForm
            initialValues={initialValues}
            status="pending"
            mode="create"
            onSubmit={(data) => handleSave(data)}
            isLoading={saving}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <BlogPreview
        blog={previewBlog}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </div>
  );
}
