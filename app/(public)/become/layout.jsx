export const metadata = {
  title: "Join OrbsAI Business Network",
  description: "Register your company or become a supplier on OrbsAI. Join thousands of verified businesses, showcase your services, and connect with potential clients worldwide. Start building your business profile today.",
  keywords: ["business registration", "supplier network", "company directory", "business listing", "OrbsAI", "business profile"],
  openGraph: {
    title: "Join OrbsAI Business Network",
    description: "Register your company or become a supplier on OrbsAI. Join thousands of verified businesses worldwide.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export default function BecomeLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <BreadcrumbNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
