"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BlogForm from "@/app/business/_components/blogs/BlogForm";
import { Plus } from "lucide-react";

export default function AddBlogDialog({
  tenantType,
  tenantId,
  onCreated,
  triggerClassName,
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialValues = {
    title: "",
    excerpt: "",
    content: "",
    blogImage: null,
    category: "",
    tags: [],
    readingTime: "",
  };

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
        category: form.category || null,
        tags: Array.isArray(form.tags) ? form.tags : [],
        readingTime: form.readingTime ? Number(form.readingTime) : null,
      };

      let res;
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

      toast.success("تم إنشاء المقال بنجاح");
      setOpen(false);
      onCreated?.(result.blog);
    } catch (e) {
      toast.error(e?.message || "فشل في حفظ المقال");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="font-medium">مقال جديد</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[85vw] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <BlogForm
          initialValues={initialValues}
          status="pending"
          mode="create"
          onSubmit={(data) => handleSave(data)}
          isLoading={saving}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
