import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyOverview({ company }) {
  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="border-b sticky top-[56px] z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">
              {company.name} overview
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          <div className="rounded-md border p-4 sm:p-5">
            <p className="text-sm text-muted-foreground leading-6">
              {company.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
