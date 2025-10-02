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
 * Wrapper component to handle role-based rendering with unified loading state
 * Shows a single loading state while determining which content to show
 */
export function RoleBasedLayout({
  companyContent,
  userContent,
  supplierContent,
  loadingFallback = <LoadingSpinner />,
}) {
  const { role, isReady } = useUserRole();

  // Show loading while determining role
  if (!isReady) {
    return loadingFallback;
  }

  // Render based on role
  if (role === "company") return companyContent;
  if (role === "supplier") return supplierContent;
  return userContent;
}
