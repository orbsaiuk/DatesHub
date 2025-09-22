import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import ConversationPageClient from "./ConversationPageClient";

export const metadata = {
  title: "Conversation",
  description: "View conversation",
};

export default async function ConversationPage({ params }) {
  const { userId } = await auth();
  const { id: conversationId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  if (!conversationId) {
    notFound();
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto">
        <Suspense
          fallback={
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Loading conversation...
              </p>
            </div>
          }
        >
          <ConversationPageClient conversationId={conversationId} />
        </Suspense>
      </div>
    </div>
  );
}
