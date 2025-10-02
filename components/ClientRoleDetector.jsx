"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

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

export function RoleContent({
  role: requiredRole,
  children,
  fallback,
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

export function RoleBasedLayout({
  companyContent,
  userContent,
  loadingFallback,
}) {
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

  if (!isReady || !isLoaded) {
    return loadingFallback;
  }

  if (role === "company") return companyContent;
  return userContent;
}
