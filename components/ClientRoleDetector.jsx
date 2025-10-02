"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/**
 * Client-side role detector
 * Returns the user's role from Clerk metadata
 */
export function useUserRole() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const userRole = user?.publicMetadata?.role || "user";
      setRole(userRole);
      setIsReady(true);
    }
  }, [user, isLoaded]);

  return { role, isReady, isLoaded };
}

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Simple loading spinner component
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200" />
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0" />
      </div>
    </div>
  );
}

/**
 * Client wrapper that shows/hides content based on user role
 * Shows loading state while role is being determined
 */
export function RoleContent({
  role: requiredRole,
  children,
  fallback = <LoadingSpinner />,
  showLoadingOnFetch = true,
}) {
  const { role, isReady } = useUserRole();

  // Show loading state while fetching
  if (!isReady && showLoadingOnFetch) {
    return fallback;
  }

  // If requiredRole is an array, check if role is in the array
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(role) ? children : null;
  }

  // Single role check
  return role === requiredRole ? children : null;
}

/**
 * Shows content only for regular users (not company/supplier)
 */
export function UserOnlyContent({
  children,
  fallback,
  showLoadingOnFetch = true,
}) {
  return (
    <RoleContent
      role="user"
      fallback={fallback}
      showLoadingOnFetch={showLoadingOnFetch}
    >
      {children}
    </RoleContent>
  );
}

/**
 * Shows content only for company users
 */
export function CompanyOnlyContent({
  children,
  fallback,
  showLoadingOnFetch = true,
}) {
  return (
    <RoleContent
      role="company"
      fallback={fallback}
      showLoadingOnFetch={showLoadingOnFetch}
    >
      {children}
    </RoleContent>
  );
}

/**
 * Shows content only for supplier users
 */
export function SupplierOnlyContent({
  children,
  fallback,
  showLoadingOnFetch = true,
}) {
  return (
    <RoleContent
      role="supplier"
      fallback={fallback}
      showLoadingOnFetch={showLoadingOnFetch}
    >
      {children}
    </RoleContent>
  );
}

/**
 * Wrapper component to handle role-based rendering with role-specific loading states
 * Shows appropriate loading skeleton based on the role being loaded
 */
export function RoleBasedLayout({
  companyContent,
  userContent,
  supplierContent,
  companyLoadingFallback,
  userLoadingFallback,
  supplierLoadingFallback,
  defaultLoadingFallback = <LoadingSpinner />,
}) {
  const { role, isReady } = useUserRole();

  // Show role-specific loading while determining role
  if (!isReady) {
    // If specific loading fallbacks are provided, show user loading by default
    // (since most visitors are regular users)
    if (
      userLoadingFallback ||
      companyLoadingFallback ||
      supplierLoadingFallback
    ) {
      return userLoadingFallback || defaultLoadingFallback;
    }
    return defaultLoadingFallback;
  }

  // Render based on role
  if (role === "company") return companyContent;
  if (role === "supplier") return supplierContent;
  return userContent;
}
