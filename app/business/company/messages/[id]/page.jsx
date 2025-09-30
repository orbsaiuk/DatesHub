import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getUserCompany } from "@/services/sanity/entities";
import BusinessConversationPageClient from "./BusinessConversationPageClient";

export const metadata = {
  title: "المحادثة",
  description: "عرض المحادثة",
};

export default async function BusinessConversationPage({ params }) {
  const { userId } = await auth();
  const { id: conversationId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await getUserCompany(userId);
  const tenantId = membership?.tenantId;
  if (!tenantId) return redirect("/become");

  if (!conversationId) {
    notFound();
  }

  return (
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto">
        <Suspense
          fallback={
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                جاري تحميل المحادثة...
              </p>
            </div>
          }
        >
          <BusinessConversationPageClient
            conversationId={conversationId}
            tenantType="company"
            tenantId={tenantId}
          />
        </Suspense>
      </div>
    </div>
  );
}
