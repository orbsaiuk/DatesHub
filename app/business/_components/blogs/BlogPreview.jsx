"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Calendar, Eye, Tag } from "lucide-react";
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
    tags = [],
    status,
    publishedAt,
    readingTime,
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getContentToDisplay = () => {
    // Priority: contentHtml > content (legacy) > contentText
    const htmlContent = contentHtml || content;
    if (!htmlContent) return null;

    // If we have HTML content, format it for display
    if (typeof htmlContent === "string") {
      return formatContentForDisplay(htmlContent);
    }

    // Fallback to plain text if available
    return contentText || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-8">
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold leading-tight text-primary capitalize text-left">
                  {title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm mt-4">
                  <Badge
                    variant={getStatusColor(status)}
                    className={`text-xs font-medium ${getStatusBgColor(status)}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                  {readingTime && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{readingTime} min read</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(_createdAt)}
                  </div>
                  {status === "published" && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{views} views</span>
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
              <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
                <p className="text-gray-800 italic text-lg leading-relaxed">
                  {excerpt}
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {(contentHtml || content || contentText) && (
            <div className="my-6">
              <div
                className="prose prose-blue max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: getContentToDisplay() }}
              />
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="my-8 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
