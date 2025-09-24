import Spinner from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner label="جاري تحميل لوحة تحكم المورد…" />
    </div>
  );
}
