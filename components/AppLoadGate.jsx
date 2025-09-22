"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Spinner from "@/components/ui/spinner";

export default function AppLoadGate({ children }) {
  const { isLoaded: isClerkLoaded } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  // Removed window load and font readiness gating to improve initial paint/LCP

  useEffect(() => {
    setIsHydrated(true);

    function handleWindowLoad() {
      setIsWindowLoaded(true);
    }

    if (typeof document !== "undefined") {
      if (document.readyState === "complete") {
        setIsWindowLoaded(true);
      } else {
        window.addEventListener("load", handleWindowLoad, { once: true });
      }

      if (document.fonts && typeof document.fonts.ready?.then === "function") {
        document.fonts.ready.then(() => setAreFontsReady(true));
      } else {
        setAreFontsReady(true);
      }
    }

    return () => {
      window.removeEventListener("load", handleWindowLoad);
    };
  }, []);

  const isReady = isHydrated && isClerkLoaded;

  if (!isReady) {
    return (
      <div
        className="min-h-dvh grid place-items-center p-8"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} label="Loading app" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return children;
}
