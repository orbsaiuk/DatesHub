import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@/sanity/lib/serverClient";
import {
  USER_COMPANY_MEMBERSHIPS_QUERY,
  COMPANY_BY_TENANT_QUERY,
} from "@/sanity/queries/company";
import { redirect } from "next/navigation";

async function getUserCompany(userId) {
  const user = await writeClient.fetch(USER_COMPANY_MEMBERSHIPS_QUERY, {
    userId,
  });
  return user?.memberships?.[0];
}

async function getCompanyAwards(tenantId) {
  return await writeClient.fetch(COMPANY_BY_TENANT_QUERY, {
    tenantType: "company",
    tenantId,
  });
}

export default async function CompanyAwardsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await getUserCompany(userId);
  if (!membership?.company) {
    redirect("/become");
  }

  const company = await getCompanyAwards(membership.tenantId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Awards</h1>
        <p className="text-muted-foreground mt-2">
          Your company achievements and recognitions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {company?.awards?.length > 0 ? (
          company.awards.map((award) => (
            <div key={award._id} className="bg-card rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">🏆</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{award.title}</h3>
                  <p className="text-muted-foreground">{award.issuer}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(award.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No awards yet</h3>
            <p className="text-muted-foreground">
              Your awards and achievements will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
