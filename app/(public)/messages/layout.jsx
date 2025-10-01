import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";

export default async function MessagesLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <BreadcrumbNavigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
