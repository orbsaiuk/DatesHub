import {
  formatArabicNumber,
  formatArabicMonthYearOnly,
} from "@/lib/utils/arabic";

export default function ActivityReport({ entity }) {
  const views = Array.isArray(entity?.viewsRecent) ? entity.viewsRecent : [];
  const conversations = Array.isArray(entity?.conversationsRecent)
    ? entity.conversationsRecent
    : [];

  const monthsBack = 6;
  const now = new Date();
  const monthLabels = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(formatArabicMonthYearOnly(d));
  }

  const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
  const labelFromKey = (key) => {
    const [y, m] = key.split("-").map((n) => parseInt(n, 10));
    const d = new Date(y, m, 1);
    return formatArabicMonthYearOnly(d);
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

  const conversationsCounts = initCounts();
  for (const item of conversations) {
    const ts = new Date(item.createdAt || item._createdAt || item._updatedAt);
    if (Number.isNaN(ts.getTime())) continue;
    const k = labelFromKey(monthKey(ts));
    if (k in conversationsCounts) conversationsCounts[k] += 1;
  }

  const rows = monthLabels.map((label) => ({
    date: label,
    views: viewsCounts[label] || 0,
    conversations: conversationsCounts[label] || 0,
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
        <h2 className="text-lg sm:text-xl font-semibold">تقرير نشاط عملك</h2>
        <div className="text-xs sm:text-sm text-muted-foreground">
          آخر {monthsBack} أشهر
        </div>
      </div>
      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-lg border bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <div className="text-xs text-muted-foreground font-medium">
                التاريخ
              </div>
              <div className="text-sm font-semibold text-foreground">
                {row.date}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">📊</span>
                  <span className="text-xs text-muted-foreground">
                    المشاهدات
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {formatArabicNumber(row.views)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">💬</span>
                  <span className="text-xs text-muted-foreground">
                    المحادثات
                  </span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {formatArabicNumber(row.conversations)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-muted-foreground">
              <th className="p-3">التاريخ</th>
              <th className="p-3">المشاهدات</th>
              <th className="p-3">المحادثات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">{row.date}</td>
                <td className="pr-10">{formatArabicNumber(row.views)}</td>
                <td className="pr-10">
                  {formatArabicNumber(row.conversations)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
