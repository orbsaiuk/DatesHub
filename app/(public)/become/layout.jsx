export const metadata = {
  title: "انضم إلى شبكة OrbsAI التجارية",
  description:
    "سجل شركتك أو كن مورداً في OrbsAI. انضم إلى آلاف الشركات المعتمدة، واعرض خدماتك، وتواصل مع العملاء المحتملين حول العالم. ابدأ ببناء ملفك التجاري اليوم.",
  keywords: [
    "تسجيل الأعمال",
    "شبكة الموردين",
    "دليل الشركات",
    "قائمة الأعمال",
    "OrbsAI",
    "ملف تجاري",
  ],
  openGraph: {
    title: "انضم إلى شبكة OrbsAI التجارية",
    description:
      "سجل شركتك أو كن مورداً في OrbsAI. انضم إلى آلاف الشركات المعتمدة حول العالم.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

import HeaderClient from "@/components/HeaderClient";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export default function BecomeLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderClient />
      <BreadcrumbNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
