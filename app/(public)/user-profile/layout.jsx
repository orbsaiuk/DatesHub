import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HeaderClient from "@/components/HeaderClient";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export const metadata = {
  title: "الملف الشخصي",
  description: "إدارة الملف الشخصي والإعدادات",
};

export default async function ProfileLayout({ children }) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in?redirect_url=/user-profile");
  }

  return (
    <>
      <HeaderClient />
      <BreadcrumbNavigation />
      {children}
      <Footer />
    </>
  );
}
