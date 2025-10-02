import HeaderClient from "@/components/HeaderClient";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export const metadata = {
  title: "تصفح الموردين - دليل الأعمال OrbsAI",
  description:
    "اكتشف الموردين حول العالم. ابحث حسب الموقع والتخصص والخدمات. اعثر على شركاء أعمال موثوقين، واطلع على التقييمات، وتواصل مع الموردين في مجال عملك.",
  keywords: ["موردين", "البحث عن موردين", "شبكة الأعمال"],
  openGraph: {
    title: "تصفح الموردين - دليل الأعمال OrbsAI",
    description:
      "اكتشف الموردين حول العالم. اعثر على شركاء أعمال موثوقين وتواصل مع الموردين في مجال عملك.",
    type: "website",
  },
};

export default function SuppliersLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderClient />
      <BreadcrumbNavigation />
      {children}
      <Footer />
    </div>
  );
}
