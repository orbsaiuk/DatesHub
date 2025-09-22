"use client";

import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function HeaderAuthButtons() {
  return (
    <>
      <SignedOut>
        {/* Clerk SignInButton renders a button that opens the Clerk modal */}
        <SignInButton mode="modal">
          <Button
            size="sm"
            className="bg-transparent text-black hover:bg-accent hover:text-primary cursor-pointer"
          >
            تسجيل الدخول
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
