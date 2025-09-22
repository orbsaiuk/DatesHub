"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function WriteUserReviewModal({
  open,
  onOpenChange,
  userId,
  onSubmitted,
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!userId || rating === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/user-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, rating, title, content }),
      });
      if (!res.ok) throw new Error("submit_error");
      const data = await res.json();
      onSubmitted?.({ rating: data.rating, ratingCount: data.ratingCount });
      onOpenChange(false);
      setRating(0);
      setTitle("");
      setContent("");
    } catch (_) {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                type="button"
                className="cursor-pointer"
              >
                <Star
                  className={`${rating >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Share details (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="cursor-pointer"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
