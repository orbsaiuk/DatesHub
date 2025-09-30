"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { urlFor } from "@/sanity/lib/image";
import { CompanyLogo } from "@/components/ImageOptimized";
import {
  House,
  User,
  Star,
  MessageSquare,
  Package,
  FileText,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Gift,
  Calendar,
} from "lucide-react";

const getNavItems = (userRole) => [
  {
    href: `/business/${userRole}/dashboard`,
    label: "لوحة التحكم",
    icon: House,
  },
  { href: `/business/${userRole}/edit`, label: "تعديل الملف", icon: User },
  { href: `/business/${userRole}/calendar`, label: "الحجوزات", icon: Calendar },
  { href: `/business/${userRole}/offers`, label: "العروض", icon: Gift },
  ...(userRole === "supplier"
    ? []
    : [
        {
          href: `/business/${userRole}/reviews`,
          label: "التقييمات",
          icon: Star,
        },
      ]),
  {
    href: `/business/${userRole}/messages`,
    label: "الرسائل",
    icon: MessageSquare,
  },
  { href: `/business/${userRole}/packages`, label: "الباقات", icon: Package },
  { href: `/business/${userRole}/blogs`, label: "المدونة", icon: FileText },
];

const SidebarItem = memo(function SidebarItem({
  href,
  label,
  icon: Icon,
  onClick,
  isCollapsed = false,
  badge = null,
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + "/");

  return (
    <div className="relative group">
      <Link
        href={href}
        onClick={onClick}
        className={`relative group flex items-center ${
          isCollapsed
            ? "justify-center w-12"
            : "justify-start px-4 w-full gap-2"
        } py-3 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          isActive
            ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/40"
            : `text-muted-foreground hover:text-foreground hover:bg-muted/50 ${
                isCollapsed ? "" : "hover:translate-x-1"
              }`
        }`}
      >
        <Icon
          className={`h-5 w-5 transition-all ${
            isActive
              ? "text-primary-foreground drop-shadow"
              : "text-muted-foreground group-hover:text-foreground"
          } ${isActive ? "scale-[1.03]" : ""}`}
        />
        <span
          className={`truncate transition-all duration-200 ${
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
          } ${isActive ? "font-semibold" : ""}`}
        >
          {label}
        </span>
        {badge && !isCollapsed && (
          <span
            className={`ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
              isActive ? "bg-white text-primary" : "bg-primary text-white"
            }`}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div
          className={`absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150 pointer-events-none z-50 whitespace-nowrap ${
            isActive ? "font-semibold" : ""
          }`}
        >
          {label}
        </div>
      )}
    </div>
  );
});

export default function Sidebar({ userRole, entity, children }) {
  const navItems = getNavItems(userRole);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isBusiness = userRole === "company" || userRole === "supplier";
  const displayEntity = entity?.company || entity?.supplier || entity;
  const displayName = displayEntity?.name || "شركة";

  // Load initial collapsed state from localStorage
  useEffect(() => {
    const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
    setIsSidebarCollapsed(collapsed);
  }, []);

  // Fetch unread messages count for the business entity
  useEffect(() => {
    const load = async () => {
      try {
        const tenantId =
          entity?.tenantId ||
          entity?.company?.tenantId ||
          entity?.supplier?.tenantId ||
          "";

        const res = await fetch(
          `/api/business-unread?tenantType=${userRole}&tenantId=${tenantId}`
        );
        const data = await res.json();

        if (data?.ok) {
          const count = Number(data.count || 0);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    const handleUnreadCountUpdate = () => {
      load();
    };

    if (userRole === "company" || userRole === "supplier") {
      load();

      // Listen for unread count updates
      window.addEventListener("unreadCountUpdate", handleUnreadCountUpdate);

      return () => {
        window.removeEventListener(
          "unreadCountUpdate",
          handleUnreadCountUpdate
        );
      };
    }
  }, [userRole, entity?.tenantId]);

  // Handle collapsed state change
  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", newCollapsed.toString());
  }, [isSidebarCollapsed]);

  const handleItemClick = useCallback(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Header with integrated sidebar */}
      <div className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex">
        {/* Desktop Sidebar - Part of Header */}
        <aside
          className={`hidden md:block transition-all duration-300 overflow-hidden border-l ${
            isSidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="h-16 flex items-center bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            {/* Sidebar Header Content */}
            <div
              className={`h-16 w-full flex items-center ${
                isSidebarCollapsed
                  ? "justify-center px-2"
                  : "justify-between px-4"
              }`}
            >
              <div
                className={`flex items-center gap-3 ${
                  isSidebarCollapsed ? "hidden" : "flex"
                }`}
              >
                <CompanyLogo
                  company={displayEntity}
                  size="sm"
                  className="h-8 w-8 rounded-lg shrink-0"
                />
                <div className="text-sm font-medium">
                  <span className="font-bold">{displayName}</span>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={handleToggleCollapse}
                className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title={
                  isSidebarCollapsed
                    ? "توسيع الشريط الجانبي"
                    : "طي الشريط الجانبي"
                }
              >
                {isSidebarCollapsed ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Header Content */}
        <header className="flex-1 h-16 flex items-center justify-between px-4">
          {/* Left side - Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Menu className="h-8 w-8" />
            </button>
          </div>

          {/* Center - Empty for now */}
          <div className="hidden md:block"></div>

          {/* Right side - User actions */}
          <div className="flex items-center gap-4">
            {isBusiness ? (
              <Link href="/">
                <Button size="sm" className="cursor-pointer">
                  الرئيسية
                </Button>
              </Link>
            ) : (
              <Link href="/become">
                <Button size="sm" className="cursor-pointer">
                  انضم كشركة
                </Button>
              </Link>
            )}
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>
      </div>

      {/* Layout container with sidebar and main content */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar Navigation - Below header but aligned with sidebar */}
        <aside
          className={`hidden md:block transition-all duration-300 overflow-hidden border-l sticky top-16 self-start h-[calc(100vh-4rem)] ${
            isSidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="h-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-lg flex flex-col overflow-x-hidden min-w-0">
            {/* Navigation */}
            <nav
              className={`flex-1 ${
                isSidebarCollapsed ? "p-2" : "p-3"
              } space-y-1 overflow-y-auto overflow-x-hidden`}
            >
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  badge={
                    item.label === "الرسائل" && unreadCount > 0
                      ? unreadCount
                      : null
                  }
                  icon={item.icon}
                  isCollapsed={isSidebarCollapsed}
                  onClick={closeMobileMenu}
                />
              ))}
            </nav>

            {/* Footer */}
            <div
              className={`p-4 border-t border-border/40 flex-shrink-0 transition-all duration-300 ${
                isSidebarCollapsed ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="text-xs text-muted-foreground text-center">
                © 2025 {entity?.name || "شركة"}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-background">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">التنقل</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  badge={
                    item.label === "الرسائل" && unreadCount > 0
                      ? unreadCount
                      : null
                  }
                  icon={item.icon}
                  onClick={handleItemClick}
                  isCollapsed={false}
                />
              ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
