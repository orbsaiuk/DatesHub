"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Upload, Send, Loader2 } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import NextImage from "next/image";
import { client } from "@/sanity/lib/client";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries/categories";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z
    .object({
      html: z.string().min(1, "Content is required"),
      plainText: z.string().optional(),
    })
    .or(z.string().min(1, "Content is required")),
  blogImage: z.any().refine((v) => !!v, { message: "Blog image is required" }),
  category: z.string().min(1, "Category is required"),
});

export default function BlogForm({
  initialValues = {
    title: "",
    excerpt: "",
    content: "",
    blogImage: null,
    category: "",
  },
  status = "draft",
  mode = "create",
  isLoading = false,
  onSubmit,
  onCancel,
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const MIN_WIDTH = 1200;
  const MIN_HEIGHT = 675; // ~16:9
  const MAX_FILE_MB = 5; // optional size guard

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const fetchedCategories = await client.fetch(ALL_CATEGORIES_QUERY);
        setCategories(fetchedCategories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const errors = form.formState.errors || {};
  const blogImage = form.watch("blogImage");

  const previewUrl = useMemo(() => {
    if (!blogImage) return "";
    if (blogImage.url) return blogImage.url;
    if (blogImage instanceof File) return URL.createObjectURL(blogImage);
    return "";
  }, [blogImage]);

  const handleSubmit = (data) => {
    if (onSubmit) onSubmit(data);
  };

  const isSubmitDisabled = () => {
    const values = form.getValues();
    const hasTitle = !!values.title?.trim();
    const hasExcerpt = !!values.excerpt?.trim();
    const content = values.content;
    const hasContent =
      typeof content === "string" ? !!content.trim() : !!content?.html?.trim();
    const hasImage = !!form.getValues("blogImage");
    const hasCategory = !!form.getValues("category");
    return (
      isLoading ||
      !(hasTitle && hasExcerpt && hasContent && hasImage && hasCategory)
    );
  };

  return (
    <form
      className="space-y-4 sm:space-y-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create New Blog Post" : "Edit Blog Post"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-600">*</span>
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter blog post title..."
              className={`min-h-[44px] ${errors.title ? "border-red-500" : ""}`}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">
              Excerpt <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="excerpt"
              {...form.register("excerpt")}
              placeholder="Brief description of your blog post..."
              rows={3}
              className={`min-h-[88px] ${errors.excerpt ? "border-red-500" : ""}`}
            />
            <p className="text-sm text-muted-foreground">
              {(form.watch("excerpt") || "").length}/200 characters
            </p>
            {errors.excerpt && (
              <p className="text-sm text-red-500">{errors.excerpt.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-600">*</span>
            </Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={`min-h-[44px] ${errors.category ? "border-red-500" : ""}`}
                  >
                    <SelectValue
                      placeholder={
                        loadingCategories
                          ? "Loading categories..."
                          : "Select a category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCategories ? (
                      <SelectItem value="__loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-red-600">*</span>
            </Label>
            <div
              className={`border rounded-md ${errors.content ? "border-red-500" : "border-input"}`}
            >
              <Controller
                control={form.control}
                name="content"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    placeholder="Write your blog post content here..."
                  />
                )}
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Blog Image */}
          <div className="space-y-2">
            <Label>
              Blog Image <span className="text-red-600">*</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
              {blogImage ? (
                <div className="space-y-3">
                  <NextImage
                    src={previewUrl}
                    alt="Blog image"
                    width={48}
                    height={48}
                    loading="lazy"
                    className="max-h-32 sm:max-h-48 mx-auto rounded w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      form.setValue("blogImage", null, { shouldValidate: true })
                    }
                    className="min-h-[44px] px-4 py-2"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("blog-image").click()
                      }
                      className="min-h-[44px] px-4 py-2"
                    >
                      Upload Blog Image
                    </Button>
                    <input
                      id="blog-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        if (!file) {
                          form.setValue("blogImage", null, {
                            shouldValidate: true,
                          });
                          return;
                        }
                        // Size check
                        const fileMb = file.size / (1024 * 1024);
                        if (fileMb > MAX_FILE_MB) {
                          form.setError("blogImage", {
                            message: `Image is too large. Max ${MAX_FILE_MB}MB.`,
                          });
                          e.target.value = "";
                          return;
                        }
                        // Dimension check
                        const url = URL.createObjectURL(file);
                        const img = new Image();
                        img.onload = () => {
                          const { width, height } = img;
                          URL.revokeObjectURL(url);
                          if (width < MIN_WIDTH || height < MIN_HEIGHT) {
                            form.setError("blogImage", {
                              message: `Image too small. Minimum ${MIN_WIDTH}x${MIN_HEIGHT}px recommended (16:9).`,
                            });
                            e.target.value = "";
                            return;
                          }
                          // Clear prior error and set value
                          form.clearErrors("blogImage");
                          form.setValue("blogImage", file, {
                            shouldValidate: true,
                          });
                        };
                        img.onerror = () => {
                          URL.revokeObjectURL(url);
                          form.setError("blogImage", {
                            message: "Invalid image file.",
                          });
                          e.target.value = "";
                        };
                        img.src = url;
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Recommended: 1200×675 px (16:9), min 1200×675, max{" "}
                    {MAX_FILE_MB}MB.
                  </p>
                </div>
              )}
            </div>
            {errors.blogImage && (
              <p className="text-sm text-red-500">{errors.blogImage.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="cursor-pointer min-h-[44px] px-4 py-2 w-full sm:w-auto order-2 sm:order-1"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>

        {status !== "published" && (
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitDisabled()}
            className="cursor-pointer min-h-[44px] px-4 py-2 w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {!isLoading && <Send className="h-4 w-4 mr-2" />}
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </form>
  );
}
