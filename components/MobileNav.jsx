"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  MenuIcon,
  Bookmark,
  MessageSquare,
  Home,
  Building2,
  Users,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import HeaderAuthButtons from "./HeaderAuthButtons";
import { cn } from "@/lib/utils";

export default function MobileNav({
  role,
  isBusiness,
  isCompany,
  dashboardHref,
  directoryHref,
  directoryLabel,
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const NavLink = ({ href, children, icon: Icon, onClick }) => {
    // Check if this link matches the current path
    const isActive =
      pathname === href ||
      (href !== "/" && pathname?.startsWith(href)) ||
      (href.startsWith("#") && pathname === "/");

    return (
      <SheetClose asChild>
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            "flex items-center justify-between px-4 py-4 rounded-lg text-base font-medium transition-all duration-200",
            "hover:bg-accent/50 hover:text-accent-foreground",
            "active:scale-[0.98] active:bg-accent/80",
            isActive && "bg-primary/10 text-primary font-semibold"
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-md bg-muted/80",
                  isActive && "bg-primary/20 text-primary"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
              </div>
            )}
            <span>{children}</span>
          </div>
          <ChevronLeft className="h-4 w-4 opacity-50" />
        </Link>
      </SheetClose>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden hover:bg-accent/50 border-none"
          aria-label="فتح القائمة"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-sm p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 text-right">
          <SheetTitle className="text-xl">القائمة</SheetTitle>
        </SheetHeader>

        <Separator />

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            <NavLink href="/" icon={Home}>
              الرئيسية
            </NavLink>
            <NavLink href={directoryHref} icon={Users}>
              {directoryLabel}
            </NavLink>

            <SignedIn>
              <Separator className="my-3" />
              <NavLink href="/bookmarks" icon={Bookmark}>
                المحفوظات
              </NavLink>
              {!isBusiness && (
                <NavLink href="/messages" icon={MessageSquare}>
                  الرسائل
                </NavLink>
              )}
            </SignedIn>
          </div>
        </nav>

        <Separator />

        <div className="p-4 space-y-3">
          <SignedIn>
            {isBusiness && (
              <SheetClose asChild>
                <Link href={dashboardHref} className="block">
                  <Button size="lg" className="w-full text-base">
                    لوحة التحكم
                  </Button>
                </Link>
              </SheetClose>
            )}
            {!isBusiness && (
              <SheetClose asChild>
                <Link href="/become" className="block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-base"
                  >
                    انضم كشركة
                  </Button>
                </Link>
              </SheetClose>
            )}
          </SignedIn>
          <SheetFooter className="flex items-center justify-between">
            <SignedOut>
              <SheetClose asChild>
                <Link href="/become" className="block">
                  <Button size="lg" className="w-full text-base">
                    انضم كشركة
                  </Button>
                </Link>
              </SheetClose>
            </SignedOut>

            <div onClick={() => setOpen(false)}>
              <HeaderAuthButtons />
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
