"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Eye } from "lucide-react";
import { formatContentForDisplay } from "@/lib/contentUtils";
import Image from "next/image";

export default function BlogPreview({ blog, open, onOpenChange }) {
  if (!blog) return null;

  const {
    title,
    excerpt,
    content,
    contentHtml,
    contentText,
    blogImage,
    status,
    views = 0,
    _createdAt,
  } = blog;

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-50 border-green-200 text-green-700";
      case "pending":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "rejected":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published":
        return "منشور";
      case "pending":
        return "قيد المراجعة";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getContentToDisplay = () => {
    const htmlContent = contentHtml || content;
    if (!htmlContent) return null;
    if (typeof htmlContent === "string") {
      return formatContentForDisplay(htmlContent);
    }
    return contentText || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-8">
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-center text-2xl font-bold leading-tight text-primary capitalize">
                  {title}
                </DialogTitle>
                <div className="flex flex-wrap items-center justify-end gap-3 text-sm mt-4">
                  <Badge
                    variant={getStatusColor(status)}
                    className={`text-xs font-medium ${getStatusBgColor(status)}`}
                  >
                    {getStatusLabel(status)}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(_createdAt)}
                  </div>
                  {status === "published" && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{views} مشاهدة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          {blogImage?.asset?.url && (
            <div className="relative mb-0">
              <Image
                src={blogImage.asset.url}
                alt={blogImage.alt || title}
                width={1000}
                height={1000}
                className="w-full h-72 object-cover rounded-lg shadow-md"
                loading="lazy"
                quality={85}
                sizes="100vw"
              />
            </div>
          )}

          {excerpt && (
            <div className="my-6">
              <div className="p-5 bg-blue-50 rounded-lg border-r-4 border-blue-500 shadow-sm">
                <p className="text-gray-800 italic text-lg leading-relaxed">
                  {excerpt}
                </p>
              </div>
            </div>
          )}

          {contentHtml && (
            <div className="my-6">
              <div
                className="prose prose-blue max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: getContentToDisplay() }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
