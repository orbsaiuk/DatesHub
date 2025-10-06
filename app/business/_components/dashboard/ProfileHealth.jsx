import Link from "next/link";
import { formatArabicNumber } from "@/lib/utils/arabic";

export default function ProfileHealth({ entity, entityType }) {
  // Align checks with Edit page sections (6):
  // 1) Company Information, 2) Locations, 3) Contact, 4) Services,
  // 5) Our Works, 6) Awards
  const hasCompanyInfo = Boolean(
    entity?.name &&
    entity.name.trim() &&
    (entity?.descriptionText?.trim() || entity?.logo)
  );

  const hasLocations = Array.isArray(entity?.locations)
    ? entity.locations.length > 0
    : false;

  const hasContact = (() => {
    const contact = entity?.contact || {};
    const hasAnyContactField = [
      contact.ownerName,
      contact.phone,
      contact.email,
      contact.address,
    ]
      .map((v) => (typeof v === "string" ? v.trim() : v))
      .some(Boolean);
    if (entityType === "supplier") {
      return hasAnyContactField;
    }
    const hasSocialLinks = Array.isArray(entity?.socialLinks)
      ? entity.socialLinks.length > 0
      : false;
    return hasAnyContactField && hasSocialLinks;
  })();

  const hasServices = Array.isArray(entity?.categories)
    ? entity.categories.filter(Boolean).length > 0
    : false;



  const checks = [
    hasCompanyInfo,
    hasLocations,
    hasContact,
    hasServices,

  ];
  const completed = checks.filter(Boolean).length;
  const total = checks.length;
  const pct = Math.round((completed / total) * 100);

  const barColor =
    pct >= 80 ? "bg-green-600" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        صحة الملف الشخصي
      </h2>
      <div className="h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground">
          {formatArabicNumber(pct)}% مكتمل ({formatArabicNumber(completed)}/{formatArabicNumber(total)} أقسام)
        </span>
        {pct < 100 && (
          <Link
            href={`/business/${entityType}/edit`}
            className="text-xs sm:text-sm underline hover:no-underline"
          >
            أكمل ملفك الشخصي
          </Link>
        )}
      </div>
    </div>
  );
}
