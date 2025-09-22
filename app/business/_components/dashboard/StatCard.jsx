export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradientFrom,
  gradientTo,
  iconBgColor,
  iconColor,
}) {
  return (
    <div
      className={`bg-gradient-to-br from-${gradientFrom} to-${gradientTo} dark:from-${gradientFrom}/20 dark:to-${gradientTo}/20 p-4 sm:p-6 rounded-xl border`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold leading-tight">{value}</p>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`h-12 w-12 sm:h-14 sm:w-14 rounded-lg ${iconBgColor} flex items-center justify-center select-none`}
        >
          <span className={`${iconColor} text-base sm:text-lg`} aria-hidden>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}
