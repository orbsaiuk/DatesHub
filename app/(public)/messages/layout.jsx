import HeaderClient from "@/components/HeaderClient";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export default async function MessagesLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderClient />
      <BreadcrumbNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
