import Sidebar from "@/app/business/_components/Sidebar";
import { writeClient } from "@/sanity/lib/serverClient";
import { getUserCompany, getUserSupplier } from "@/services/sanity/entities";
import { getCurrentSubscription } from "@/services/sanity/subscriptions";
import { auth } from "@clerk/nextjs/server";
import { USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY } from "@/sanity/queries/user";

export const metadata = {
  robots: { index: false, follow: false },
  title: "الأعمال",
  description: "لوحة تحكم الأعمال والإدارة.",
};

export default async function BusinessLayout({ children }) {
  const { userId } = await auth();
  let role = null;
  let company = null;
  let supplier = null;
  let subscription = null;

  if (userId) {
    const profile = await writeClient.fetch(
      USER_ROLE_AND_MEMBERSHIPS_BY_CLERK_ID_QUERY,
      { userId }
    );
    role = profile?.role || null;

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
