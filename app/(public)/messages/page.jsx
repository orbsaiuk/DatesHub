import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MessagesPageClient from "./MessagesPageClient";
export const metadata = {
  title: "الرسائل",
  description: "عرض وإدارة الرسائل",
};

export default async function MessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2"> الرسائل</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              إدارة المحادثات مع الشركات
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  جاري تحميل الرسائل...
                </p>
              </div>
            }
          >
            <MessagesPageClient />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
