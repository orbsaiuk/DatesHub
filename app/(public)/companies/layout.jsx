import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export const metadata = {
  title: "تصفح الشركات - دليل الأعمال OrbsAI",
  description:
    "اكتشف الشركات حول العالم. ابحث حسب الموقع والتخصص والخدمات. اعثر على شركاء أعمال موثوقين، واطلع على التقييمات، وتواصل مع الشركات في مجال عملك.",
  keywords: ["شركات", "البحث عن شركات", "شبكة الأعمال"],
  openGraph: {
    title: "تصفح الشركات - دليل الأعمال OrbsAI",
    description:
      "اكتشف الشركات حول العالم. اعثر على شركاء أعمال موثوقين وتواصل مع الشركات في مجال عملك.",
    type: "website",
  },
};

export default function CompaniesLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <BreadcrumbNavigation />
      {children}
      <Footer />
    </div>
  );
}
