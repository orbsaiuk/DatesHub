export default function RatingBreakdown({ reviews, total }) {
  const counts = [1, 2, 3, 4, 5].reduce((acc, r) => {
    acc[r] = 0;
    return acc;
  }, {});
  for (const r of reviews) {
    const value = Number(r?.rating || 0);
    if (value >= 1 && value <= 5) counts[value] += 1;
  }
  const overall = Math.max(total || reviews.length || 0, 0);

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = counts[star] || 0;
        const pct = overall ? Math.round((count / overall) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {star}★
            </span>
            <div className="flex-1 h-2 sm:h-3 rounded bg-muted overflow-hidden">
              <div
                className="h-2 sm:h-3 bg-yellow-400"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-12 text-right text-xs sm:text-sm text-muted-foreground">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
