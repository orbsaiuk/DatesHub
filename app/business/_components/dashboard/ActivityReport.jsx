export default function ActivityReport({ entity }) {
  const views = Array.isArray(entity?.viewsRecent) ? entity.viewsRecent : [];

  const monthsBack = 6;
  const now = new Date();
  const monthLabels = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(
      d.toLocaleString(undefined, { month: "short", year: "numeric" })
    );
  }

  const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
  const labelFromKey = (key) => {
    const [y, m] = key.split("-").map((n) => parseInt(n, 10));
    const d = new Date(y, m, 1);
    return d.toLocaleString(undefined, { month: "short", year: "numeric" });
  };

  const initCounts = () =>
    monthLabels.reduce((acc, label) => {
      acc[label] = 0;
      return acc;
    }, {});

  const viewsCounts = initCounts();
  for (const item of views) {
    const ts = new Date(item.createdAt || item._createdAt || item._updatedAt);
    if (Number.isNaN(ts.getTime())) continue;
    const k = labelFromKey(monthKey(ts));
    if (k in viewsCounts) viewsCounts[k] += 1;
  }

  const rows = monthLabels.map((label) => ({
    date: label,
    views: viewsCounts[label] || 0,
    messages: 0,
  }));

  const totalViews = Number(entity?.totalViews || 0);
  const currentMonthLabel = labelFromKey(monthKey(new Date()));
  const currentIdx = rows.findIndex((r) => r.date === currentMonthLabel);
  if (currentIdx >= 0) {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const allViewsAreThisMonth =
      views.length === 0 ||
      views.every((v) => {
        const ts = new Date(v.createdAt || v._createdAt || v._updatedAt);
        return !Number.isNaN(ts.getTime()) && ts >= startOfMonth;
      });
    if (allViewsAreThisMonth && totalViews > rows[currentIdx].views) {
      rows[currentIdx].views = totalViews;
    }
  }

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">
          Your Business Activity Report
        </h2>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Last {monthsBack} months
        </div>
      </div>
      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Period</div>
              <div className="text-sm font-medium">{row.date}</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{row.views}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium">{row.messages}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Period</th>
              <th className="p-3">Profile Views</th>
              <th className="p-3">Messages</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">{row.date}</td>
                <td className="p-3">{row.views}</td>
                <td className="p-3">{row.messages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
