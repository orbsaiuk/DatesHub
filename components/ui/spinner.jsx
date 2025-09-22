export default function Spinner({
  size = 24,
  className = "",
  label = "جارٍ التحميل",
}) {
  const dimension = typeof size === "number" ? `${size}px` : size;
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="inline-block animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary"
        style={{ width: dimension, height: dimension }}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
