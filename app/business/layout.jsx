import Sidebar from "@/app/business/_components/Sidebar";
import { getUserCompany, getUserSupplier } from "@/services/sanity/entities";
import { getCurrentSubscription } from "@/services/sanity/subscriptions";
import { getAuthenticatedUser } from "@/lib/auth/authorization";

export const metadata = {
  robots: { index: false, follow: false },
  title: "الأعمال",
  description: "لوحة تحكم الأعمال والإدارة.",
};

export default async function BusinessLayout({ children }) {
  // Get user with role fallback - checks sessionClaims first, then Clerk API if needed
  const user = await getAuthenticatedUser();
  const userId = user?.userId;
  const role = user?.role || null;
  let company = null;
  let supplier = null;
  let subscription = null;

  if (userId && role) {
    // Get company data if user has company role
    if (role === "company") {
      company = await getUserCompany(userId);
      if (company?.tenantId) {
        subscription = await getCurrentSubscription(
          "company",
          company.tenantId
        );
      }
    } else if (role === "supplier") {
      supplier = await getUserSupplier(userId);
      if (supplier?.tenantId) {
        subscription = await getCurrentSubscription(
          "supplier",
          supplier.tenantId
        );
      }
    }
  }

  return (
    <Sidebar
      userRole={role}
      entity={role === "company" ? company : supplier}
      subscription={subscription}
    >
      {children}
    </Sidebar>
  );
}
