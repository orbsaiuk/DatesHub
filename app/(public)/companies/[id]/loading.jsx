import CompanyDetailsSkeleton from "./_components/CompanyDetailsSkeleton";
import Spinner from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div>
      <CompanyDetailsSkeleton />
      <div className="flex justify-center my-8">
        <Spinner label="Loading company details…" />
      </div>
    </div>
  );
}
