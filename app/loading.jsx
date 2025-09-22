import Spinner from "@/components/ui/spinner";

export default function RootLoading() {
  return (
    <div
      className="min-h-dvh grid place-items-center p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size={32} label="جارٍ تحميل الصفحة" />
        <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
      </div>
    </div>
  );
}
