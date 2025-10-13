"use client";

import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "lucide-react";

export default function HeaderAuthButtons() {
  const { user } = useUser();

  return (
    <>
      <SignedOut>
        {/* Clerk SignInButton renders a button that opens the Clerk modal */}
        <SignInButton mode="modal">
          <Button
            size="sm"
            className="bg-transparent text-black hover:text-white hover:bg-button-1-hover cursor-pointer"
          >
            تسجيل الدخول
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="hidden md:block">
          <UserButton />
        </div>
        <div className="block md:hidden">
          <Link href="/user-profile">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "المستخدم"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
              <span className="text-sm font-medium text-primary">
                {user?.firstName || "الملف الشخصي"}
              </span>
            </Button>
          </Link>
        </div>
      </SignedIn>
    </>
  );
}
