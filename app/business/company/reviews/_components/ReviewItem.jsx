import { Badge } from "@/components/ui/badge";

export default function ReviewItem({ review }) {
  const authorInitial = (review?.authorName || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="bg-card rounded-lg sm:rounded-xl border p-4 pb-2 sm:p-6 sm:pb-2">
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted text-foreground/80 flex items-center justify-center text-sm sm:text-base font-medium">
          {authorInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg leading-snug truncate">
                {review.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <span>
                  بواسطة{" "}
                  <span className="font-medium text-foreground/90">
                    {review.authorName}
                  </span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:text-right">
              <div
                className="flex"
                aria-label={`Rating: ${review.rating} out of 5`}
              >
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm sm:text-base ${i < Number(review.rating) ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-[10px] sm:text-xs rounded-md"
              >
                {review.rating}/5
              </Badge>
            </div>
          </div>
          <div className="prose prose-sm sm:prose-base max-w-none break-words mt-2">
            <p className="text-muted-foreground leading-relaxed">
              {review.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
