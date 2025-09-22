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
      return data.name || `شركة ${id}`;
    }
  } catch (error) {
    console.error("Error fetching company name:", error);
  }
  return `شركة ${id}`;
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

// Function to get blog title from slug (you can enhance this with API calls)
const getBlogTitle = (slug) => {
  // This could be enhanced to fetch actual blog title from API
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function BreadcrumbNavigation({
  className = "",
  customBreadcrumbs = null,
  showHome = true,
}) {
  const pathname = usePathname();
  const { customBreadcrumbs: contextBreadcrumbs } = useBreadcrumb();
  const [companyNames, setCompanyNames] = useState({});
  const [conversationLabels, setConversationLabels] = useState({});
  const [loading, setLoading] = useState(false);

  // Use context breadcrumbs first, then prop breadcrumbs, then auto-generate
  const activeBreadcrumbs = contextBreadcrumbs || customBreadcrumbs;

  // Extract company IDs and conversation IDs from pathname to preload labels
  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const companyIds = [];
    const conversationIds = [];

    pathSegments.forEach((segment, index) => {
      if (pathSegments[index - 1] === "companies" && index > 0) {
        companyIds.push(segment);
      }
      if (pathSegments[index - 1] === "messages" && index > 0) {
        conversationIds.push(segment);
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
  pathSegments.forEach((segment, index) => {
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
      const companyName =
        companyNames[companyId] ||
        (loading ? "جارٍ التحميل..." : `شركة ${companyId}`);

      breadcrumbs.push({
        label: companyName,
        href: null, // Company detail page is always the last item
        icon: null,
      });

      return; // Skip processing the next segment since we handled it
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
      return;
    } else if (
      (pathSegments[index - 1] === "companies" && index > 0) ||
      (pathSegments[index - 1] === "messages" && index > 0)
    ) {
      // Skip this segment as it was already processed above
      return;
    } else if (pathSegments[index - 1] === "blogs" && index > 0) {
      // For blog post page
      label = getBlogTitle(segment);
      href = null; // Blog post page is always the last item
    }

    breadcrumbs.push({
      label,
      href,
      icon: config.icon,
    });
  });

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
