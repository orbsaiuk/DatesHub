"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Calendar, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function BlogCard({
  blog,
  onPreview,
  onDelete, // immediate delete
  onAskDelete, // legacy confirm path
  showActions = true,
  pending = { id: null, type: null },
}) {
  // No local dialog; deletion handled by parent. Keep UI overlay via `pending`.

  const {
    _id,
    title,
    excerpt,
    blogImage,
    status,
    publishedAt,
    views = 0,
    _createdAt,
  } = blog;

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "default";
      case "pending":
        return "secondary";
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
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const deleting =
    pending.id === _id && (pending.type === "delete" || !pending.type);

  return (
    <Card
      className="h-full flex flex-col gap-0 relative overflow-hidden"
      aria-busy={deleting}
    >
      {deleting && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جاري الحذف...</span>
          </div>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2 capitalize">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge
                variant={getStatusColor(status)}
                className={`text-xs ${getStatusBgColor(status)}`}
              >
                {getStatusLabel(status)}
              </Badge>
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 touch-manipulation cursor-pointer"
                  disabled={deleting}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onPreview && (
                  <DropdownMenuItem
                    onClick={() => onPreview(blog)}
                    disabled={deleting}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    معاينة
                  </DropdownMenuItem>
                )}
                {(onDelete || onAskDelete) && (
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() =>
                      onDelete ? onDelete(blog) : onAskDelete(blog)
                    }
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Featured Image */}
        {blogImage?.asset?.url && (
          <div className="mb-4">
            <Image
              src={blogImage.asset.url}
              alt={blogImage.alt || title}
              className="w-full h-32 sm:h-36 lg:h-32 object-cover rounded-md"
              loading="lazy"
              width={1000}
              height={1000}
              quality={85}
              sizes="100vw"
            />
          </div>
        )}

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {excerpt}
          </p>
        )}

        {/* Category */}
        {blog.category && (
          <div className="mb-3">
            <Badge
              variant="default"
              className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              {blog.category.title}
            </Badge>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {status === "published" && publishedAt
                  ? `نُشر في ${formatDate(publishedAt)}`
                  : `أُنشئ في ${formatDate(_createdAt)}`}
              </span>
            </div>

            {status === "published" && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{views} مشاهدة</span>
              </div>
            )}
          </div>

          {status === "rejected" && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              تم رفض هذا المقال. يرجى المراجعة وإعادة الإرسال.
            </div>
          )}

          {status === "pending" && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              هذا المقال قيد المراجعة.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
