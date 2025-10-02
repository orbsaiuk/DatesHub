import Spinner from "@/components/ui/spinner";

export default function PageLoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size={32} />
    </div>
  );
}
