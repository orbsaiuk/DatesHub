"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  Building2,
  Users,
  FileText,
  Bookmark,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

// Route configuration with icons and labels
const routeConfig = {
  "": { label: "الرئيسية", icon: Home },
  companies: { label: "الشركات", icon: Building2 },
  suppliers: { label: "الموردين", icon: Building2 },
  blogs: { label: "المدونة", icon: FileText },
  bookmarks: { label: "المحفوظات", icon: Bookmark },
  become: { label: "انضم إلينا", icon: UserPlus },
  messages: { label: "الرسائل", icon: MessageSquare },
};

// Function to get company name from slug/id (enhanced with API call)
const getCompanyName = async (id) => {
  try {
    const response = await fetch(
      `/api/company?tenantId=${encodeURIComponent(id)}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.name || " تحميل...";
    }
  } catch (error) {
    console.error("Error fetching company name:", error);
  }
  return `شركة ${id}`;
};

const getSupplierName = async (id) => {
  try {
    const response = await fetch(
      `/api/supplier?tenantId=${encodeURIComponent(id)}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.name || data?.supplier?.name || " تحميل...";
    }
  } catch (error) {
    console.error("Error fetching supplier name:", error);
  }
  return `مورد ${id}`;
};

// Function to get conversation label (other participant display name)
const getConversationLabel = async (conversationId) => {
  try {
    const response = await fetch(`/api/messaging/user/conversations?limit=100`);
    if (response.ok) {
      const data = await response.json();
      const conv = (data.items || []).find((c) => c._id === conversationId);
      if (conv) {
        const other = (conv.participants || []).find((p) => p.kind !== "user");
        return other?.displayName || other?.name || "محادثة";
      }
    }
  } catch (error) {
    console.error("Error fetching conversation label:", error);
  }
  return "محادثة";
};

// Function to get blog title from ID
const getBlogTitle = async (id) => {
  try {
    const response = await fetch(`/api/blogs/${encodeURIComponent(id)}`);
    if (response.ok) {
      const data = await response.json();
      return data.title || `تحميل...`;
    }
  } catch (error) {
    console.error("Error fetching blog title:", error);
  }
  return `مقالة ${id}`;
};

export default function BreadcrumbNavigation({
  className = "",
  customBreadcrumbs = null,
  showHome = true,
}) {
  const pathname = usePathname();
  const { customBreadcrumbs: contextBreadcrumbs } = useBreadcrumb();
  const [companyNames, setCompanyNames] = useState({});
  const [supplierNames, setSupplierNames] = useState({});
  const [conversationLabels, setConversationLabels] = useState({});
  const [blogTitles, setBlogTitles] = useState({});
  const [loading, setLoading] = useState(false);

  // Use context breadcrumbs first, then prop breadcrumbs, then auto-generate
  const activeBreadcrumbs = contextBreadcrumbs || customBreadcrumbs;

  // Extract company IDs, conversation IDs, and blog IDs from pathname to preload labels
  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const companyIds = [];
    const conversationIds = [];
    const supplierIds = [];
    const blogIds = [];
    pathSegments.forEach((segment, index) => {
      if (pathSegments[index - 1] === "companies" && index > 0) {
        companyIds.push(segment);
      }
      if (pathSegments[index - 1] === "messages" && index > 0) {
        conversationIds.push(segment);
      }
      if (pathSegments[index - 1] === "suppliers" && index > 0) {
        supplierIds.push(segment);
      }
      if (pathSegments[index - 1] === "blogs" && index > 0) {
        blogIds.push(segment);
      }
    });

    if (companyIds.length > 0) {
      // Only fetch names for company IDs we don't already have
      const missingIds = companyIds.filter((id) => !companyNames[id]);

      if (missingIds.length > 0) {
        setLoading(true);
        Promise.all(
          missingIds.map(async (id) => {
            const name = await getCompanyName(id);
            return { id, name };
          })
        ).then((results) => {
          const newNames = results.reduce((acc, { id, name }) => {
            acc[id] = name;
            return acc;
          }, {});
          setCompanyNames((prev) => ({ ...prev, ...newNames }));
          setLoading(false);
        });
      }
    }

    if (conversationIds.length > 0) {
      const missingConvIds = conversationIds.filter(
        (id) => !conversationLabels[id]
      );
      if (missingConvIds.length > 0) {
        Promise.all(
          missingConvIds.map(async (id) => {
            const label = await getConversationLabel(id);
            return { id, label };
          })
        ).then((results) => {
          const newLabels = results.reduce((acc, { id, label }) => {
            acc[id] = label;
            return acc;
          }, {});
          setConversationLabels((prev) => ({ ...prev, ...newLabels }));
        });
      }
    }
    if (supplierIds.length > 0) {
      const missingSupplierIds = supplierIds.filter((id) => !supplierNames[id]);
      if (missingSupplierIds.length > 0) {
        Promise.all(
          missingSupplierIds.map(async (id) => {
            const name = await getSupplierName(id);
            return { id, name };
          })
        ).then((results) => {
          const newNames = results.reduce((acc, { id, name }) => {
            acc[id] = name;
            return acc;
          }, {});
          setSupplierNames((prev) => ({ ...prev, ...newNames }));
        });
      }
    }

    if (blogIds.length > 0) {
      const missingBlogIds = blogIds.filter((id) => !blogTitles[id]);
      if (missingBlogIds.length > 0) {
        Promise.all(
          missingBlogIds.map(async (id) => {
            const title = await getBlogTitle(id);
            return { id, title };
          })
        ).then((results) => {
          const newTitles = results.reduce((acc, { id, title }) => {
            acc[id] = title;
            return acc;
          }, {});
          setBlogTitles((prev) => ({ ...prev, ...newTitles }));
        });
      }
    }
  }, [pathname]); // Remove companyNames from dependencies

  // If custom breadcrumbs are provided, use them
  if (activeBreadcrumbs) {
    return (
      <div className={`bg-gray-50/50 border-b border-gray-200 ${className}`}>
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              {showHome && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/"
                      className="flex items-center gap-1.5"
                    >
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">الرئيسية</span>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              {activeBreadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="flex items-center gap-1.5"
                      >
                        {crumb.icon && <crumb.icon className="h-4 w-4" />}
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="flex items-center gap-1.5">
                        {crumb.icon && <crumb.icon className="h-4 w-4" />}
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < activeBreadcrumbs.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    );
  }

  // Auto-generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbs = [];

  // Add home if requested
  if (showHome) {
    breadcrumbs.push({
      label: "الرئيسية",
      href: "/",
      icon: Home,
    });
  }

  // Build breadcrumbs from path segments
  let currentPath = "";
  for (let index = 0; index < pathSegments.length; index++) {
    const segment = pathSegments[index];
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    const nextSegment = pathSegments[index + 1];

    // Get route config
    const config = routeConfig[segment] || { label: segment, icon: null };

    let label = config.label;
    let href = isLast ? null : currentPath;

    // Handle special routes
    if (segment === "companies" && nextSegment) {
      // If this is "companies" and there's a company ID next,
      // add companies with link to /companies and skip to company name
      breadcrumbs.push({
        label: "الشركات",
        href: "/companies",
        icon: config.icon,
      });

      // Add the company name as the final breadcrumb
      const companyId = nextSegment;
      const companyName = companyNames[companyId] || " تحميل...";

      breadcrumbs.push({
        label: companyName,
        href: null, // Company detail page is always the last item
        icon: null,
      });

      index++; // Skip processing the next segment since we handled it
      continue;
    } else if (segment === "suppliers" && nextSegment) {
      // If this is "suppliers" and there's a supplier ID next,
      // add suppliers with link to /suppliers and skip to supplier name
      breadcrumbs.push({
        label: "الموردين",
        href: "/suppliers",
        icon: config.icon,
      });

      // Add the supplier name as the final breadcrumb
      const supplierId = nextSegment;
      const supplierName = supplierNames[supplierId] || " تحميل...";

      breadcrumbs.push({
        label: supplierName,
        href: null, // Supplier detail page is always the last item
        icon: null,
      });

      index++; // Skip processing the next segment since we handled it
      continue;
    } else if (segment === "messages" && nextSegment) {
      // Messages list then conversation label
      breadcrumbs.push({
        label: "الرسائل",
        href: "/messages",
        icon: config.icon,
      });

      const convId = nextSegment;
      const label = conversationLabels[convId] || "محادثة";
      breadcrumbs.push({ label, href: null, icon: null });
      index++; // Skip processing the next segment since we handled it
      continue;
    } else if (segment === "blogs" && nextSegment) {
      // If this is "blogs" and there's a blog ID next,
      // add blogs with link to /blogs and skip to blog title
      breadcrumbs.push({
        label: "المدونة",
        href: "/blogs",
        icon: config.icon,
      });

      // Add the blog title as the final breadcrumb
      const blogId = nextSegment;
      const blogTitle = blogTitles[blogId] || " تحميل...";

      breadcrumbs.push({
        label: blogTitle,
        href: null, // Blog detail page is always the last item
        icon: null,
      });

      index++; // Skip processing the next segment since we handled it
      continue;
    }

    breadcrumbs.push({
      label,
      href,
      icon: config.icon,
    });
  }

  return (
    <div className={`bg-gray-50/50 border-b border-gray-200 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink
                      href={crumb.href}
                      className="flex items-center gap-1.5"
                    >
                      {crumb.icon && <crumb.icon className="h-4 w-4" />}
                      <span className="hidden sm:inline">{crumb.label}</span>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="flex items-center gap-1.5">
                      {crumb.icon && <crumb.icon className="h-4 w-4" />}
                      <span className="hidden sm:inline">{crumb.label}</span>
                      <span className="sm:hidden text-sm font-medium">
                        {crumb.label}
                      </span>
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
