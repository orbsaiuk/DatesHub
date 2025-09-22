import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export const metadata = {
  title: "Browse Companies - OrbsAI Business Directory",
  description:
    "Discover companies worldwide. Search by location, specialization, and services. Find trusted business partners, view ratings, and connect with companies in your industry.",
  keywords: ["companies", "company search", "business network"],
  openGraph: {
    title: "Browse Companies - OrbsAI Business Directory",
    description:
      "Discover companies worldwide. Find trusted business partners and connect with companies in your industry.",
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
