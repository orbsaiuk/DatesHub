"use client";

import { useEffect } from "react";

export default function BreadcrumbPrefetch({ prefetchedNames = {} }) {
  useEffect(() => {
    if (typeof window !== "undefined" && prefetchedNames) {
      // Store prefetched names in window object for BreadcrumbNavigation to access
      window.__breadcrumbPrefetchedNames = {
        ...window.__breadcrumbPrefetchedNames,
        ...prefetchedNames,
      };
    }
  }, [prefetchedNames]);

  return null; // This component renders nothing
}
