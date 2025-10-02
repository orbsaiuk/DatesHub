import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook to check if the user has a pending tenant request
 * Redirects to success page if a pending request exists
 */
export function usePendingRequestCheck(isLoaded, isSignedIn) {
  const router = useRouter();
  const [isCheckingPending, setIsCheckingPending] = useState(true);

  useEffect(() => {
    // Wait for Clerk to load user data
    if (!isLoaded) {
      return;
    }

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      router.replace(`/sign-in?redirect_url=/become`);
      return;
    }

    // Check if user already has a pending tenant request
    async function checkPendingRequest() {
      try {
        const res = await fetch("/api/tenant-requests");
        if (res.ok) {
          const data = await res.json();
          if (data.hasPendingRequest && data.request?._id) {
            router.replace(`/become/success?id=${data.request._id}`);
            return;
          }
        }
        // Only set to false if no pending request found
        setIsCheckingPending(false);
      } catch (error) {
        console.error("Error checking pending request:", error);
        // On error, allow showing the form
        setIsCheckingPending(false);
      }
    }

    checkPendingRequest();
  }, [isLoaded, isSignedIn, router]);

  return { isCheckingPending };
}
