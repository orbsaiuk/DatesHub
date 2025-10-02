"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MenuIcon, Bookmark } from "lucide-react";
import { SignedIn, useUser } from "@clerk/nextjs";
import HeaderAuthButtons from "./HeaderAuthButtons";
import ImageOptimized from "@/components/ImageOptimized";
import InboxDropdown from "@/components/messaging/InboxDropdown";

/**
 * Client-side Header with instant role detection
 * No server-side blocking - uses Clerk's client hooks
 */
export default function HeaderClient({ brandTitle, logoUrl }) {
  const { user, isLoaded } = useUser();

  // Get role from user metadata (available immediately after hydration)
  const role = user?.publicMetadata?.role || "user";
  const isBusiness = role === "company" || role === "supplier";
  const dashboardHref = isBusiness ? `/business/${role}/dashboard` : "#";
  const directoryHref = isBusiness ? "/suppliers" : "/companies";
  const directoryLabel = isBusiness ? "الموردين" : "الشركات";
  const title = brandTitle || "العلامة";

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-base sm:text-lg flex items-center gap-2"
        >
          {logoUrl ? (
            <ImageOptimized
              src={logoUrl}
              alt={`شعار ${title}`}
              width={120}
              height={32}
              className="h-6 w-auto"
              priority
              context="brand logo"
            />
          ) : (
            <span>{title}</span>
          )}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="#featured">شركات مميزة</Link>
          <Link href="#how">كيف تعمل المنصة</Link>
          <Link href={directoryHref}>{directoryLabel}</Link>
          <SignedIn>
            <Link href="/bookmarks">
              <Bookmark className="size-5" />
            </Link>
            {!isBusiness && <InboxDropdown />}
          </SignedIn>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          {isLoaded && isBusiness ? (
            <Link href={dashboardHref}>
              <Button size="sm" className="cursor-pointer">
                لوحة التحكم
              </Button>
            </Link>
          ) : (
            <Link href="/become">
              <Button size="sm" className="cursor-pointer">
                انضم كشركة
              </Button>
            </Link>
          )}
          <HeaderAuthButtons />
        </div>
        <div className="md:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="فتح القائمة">
                <MenuIcon className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={true} className="p-0 sm:max-w-sm">
              <div className="p-4">{/* Brand removed as requested */}</div>
              <Separator />
              <nav className="p-4 grid gap-2 text-sm">
                <Link href="#featured">شركات مميزة</Link>
                <Link href="#how">كيف تعمل المنصة</Link>
                <Link href="/companies">الشركات</Link>
                <SignedIn>
                  <Link href="/bookmarks">المحفوظات</Link>
                  {!isBusiness && <Link href="/messages">الرسائل</Link>}
                  {isLoaded && isBusiness ? (
                    <Link href={dashboardHref}>لوحة التحكم</Link>
                  ) : (
                    <Link href="/become">انضم كشركة</Link>
                  )}
                </SignedIn>
              </nav>
              <Separator />
              <div className="p-4">
                <HeaderAuthButtons />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
