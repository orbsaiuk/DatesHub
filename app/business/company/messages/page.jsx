import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCompany } from "@/services/sanity/entities";
import BusinessMessagesPageClient from "./BusinessMessagesPageClient";

export const metadata = {
  title: "Messages",
  description: "Communicate with your clients and prospects",
};

export default async function CompanyMessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await getUserCompany(userId);
  const tenantId = membership?.tenantId;
  if (!tenantId) return redirect("/become");

  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Messages</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Communicate with your clients and prospects
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading messages...
                </p>
              </div>
            }
          >
            <BusinessMessagesPageClient
              tenantType="company"
              tenantId={tenantId}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
