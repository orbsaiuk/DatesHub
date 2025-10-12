"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { SignedIn, useUser } from "@clerk/nextjs";
import HeaderAuthButtons from "./HeaderAuthButtons";
import ImageOptimized from "@/components/ImageOptimized";
import InboxDropdown from "@/components/messaging/InboxDropdown";
import MobileNav from "@/components/MobileNav";
import logo from "@/public/Logo.png";
import { usePathname } from "next/navigation";

export default function HeaderClient() {
  const { user, isLoaded } = useUser();

  // Get role from user metadata (available immediately after hydration)
  const role = user?.publicMetadata?.role || "user";
  const isBusiness = role === "company" || role === "supplier";
  const isCompany = role === "company";
  const dashboardHref = isBusiness ? `/business/${role}/dashboard` : "#";
  const directoryHref = isCompany ? "/suppliers" : "/companies";
  const directoryLabel = isCompany ? "الموردين" : "الشركات";
  const logoUrl = logo;
  const pathname = usePathname();
  return (
    <header className="w-full border-b bg-secondary/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto container px-4 sm:px-0 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-base sm:text-lg flex items-center gap-2"
        >
          <ImageOptimized
            src={logoUrl}
            alt={`شعار المنصة`}
            width={300}
            height={300}
            className="h-20 w-32"
            priority
            context="brand logo"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className={`${pathname === "/" ? " text-lg font-bold text-primary" : " hover:text-primary"}`}
          >
            الرئيسية
          </Link>
          <Link
            href={directoryHref}
            className={`${pathname === directoryHref ? " text-lg font-bold text-primary" : " hover:text-primary"}`}
          >
            {directoryLabel}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          {isLoaded && isBusiness ? (
            <Link href={dashboardHref}>
              <Button
                size="sm"
                className="cursor-pointer bg-button-1 hover:bg-button-1-hover text-white"
              >
                لوحة التحكم
              </Button>
            </Link>
          ) : (
            <Link href="/become">
              <Button
                size="sm"
                className="cursor-pointer bg-button-1 hover:bg-button-1-hover text-white"
              >
                انضم كشركة
              </Button>
            </Link>
          )}
          <SignedIn>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Link href="/bookmarks">
                <Bookmark className="size-5" />
              </Link>
            </Button>
            {!isBusiness && <InboxDropdown />}
          </SignedIn>
          <HeaderAuthButtons />
        </div>
        <div className="md:hidden">
          <MobileNav
            role={role}
            isBusiness={isBusiness}
            isCompany={isCompany}
            dashboardHref={dashboardHref}
            directoryHref={directoryHref}
            directoryLabel={directoryLabel}
          />
        </div>
      </div>
    </header>
  );
}
