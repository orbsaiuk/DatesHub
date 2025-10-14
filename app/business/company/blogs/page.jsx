import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserCompany } from "@/services/sanity/entities";
import { getBlogsForTenant } from "@/services/sanity/blogs";
import { getCurrentSubscription } from "@/services/sanity/subscriptions";
import BlogsPage from "@/app/business/_components/blogs/BlogsPage";

export const metadata = {
  title: "إدارة المدونة",
  description:
    "إدارة مقالات المدونة، كتابة مقالات جديدة، تعديل المقالات الموجودة، ونشر المحتوى",
  robots: { index: false, follow: false },
};

export default async function CompanyBlogsPage() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in?redirect_url=/business/company/blogs");
  }

  const membership = await getUserCompany(userId);
  const tenantId = membership?.tenantId;
  if (!tenantId) return redirect("/become");

  const items = await getBlogsForTenant("company", tenantId);
  const subscription = await getCurrentSubscription("company", tenantId);

  const stats = {
    total: items.length,
    rejected: items.filter((b) => b.status === "rejected").length,
    pending: items.filter((b) => b.status === "pending").length,
    published: items.filter((b) => b.status === "published").length,
  };

  return (
    <BlogsPage
      tenantType="company"
      tenantId={tenantId}
      items={items}
      stats={stats}
      subscription={subscription}
    />
  );
}
