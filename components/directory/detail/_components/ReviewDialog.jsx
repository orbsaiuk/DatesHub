"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import StarRating from "./StarRating";

export default function ReviewDialog({
  open,
  onClose,
  companyId,
  onSubmitted,
}) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [submitting, setSubmitting] = React.useState(false);
  const titleLimit = 80;
  const contentLimit = 800;

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    try {
      if (!rating || rating < 1 || rating > 5) {
        toast.error("يرجى اختيار تقييم");
        return;
      }
      if (!title.trim() || !content.trim()) {
        toast.error("يرجى ملء العنوان والمراجعة");
        return;
      }
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          rating: Number(rating),
          title,
          content,
        }),
      });
      if (res.status === 401) {
        const redirect = encodeURIComponent(`/companies/${companyId}`);
        if (typeof window !== "undefined") {
          window.location.href = `/sign-in?redirect_url=${redirect}`;
        }
        return;
      }
      if (!res.ok) throw new Error("Failed");
      const payload = await res.json().catch(() => null);
      toast.success("تم إرسال التقييم");
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("review-submitted", { detail: payload })
          );
        }
      } catch (_) {}
      onSubmitted && onSubmitted();
      onClose && onClose();
    } catch (_) {
      toast.error("لا يمكن إرسال التقييم. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (!v ? onClose && onClose() : null)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>اكتب تقييماً</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">التقييم</label>
            <div className="mt-1">
              <StarRating
                rating={rating}
                onChange={(v) => setRating(v)}
                size={20}
                ariaLabel="اختر التقييم"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">العنوان</label>
              <span className="text-xs text-muted-foreground">
                {title.length}/{titleLimit}
              </span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, titleLimit))}
              placeholder="تجربة رائعة!"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">تقييمك</label>
              <span className="text-xs text-muted-foreground">
                {content.length}/{contentLimit}
              </span>
            </div>
            <Textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value.slice(0, contentLimit))
              }
              placeholder="شارك تفاصيل تجربتك..."
              rows={5}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
