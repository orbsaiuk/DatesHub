"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import OrderRequestButton from "./OrderRequestButton";
import MessageCompanyButton from "./messaging/MessageCompanyButton";
import WaitingForResponseButton from "./WaitingForResponseButton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyInteractionButton({
  companyTenantId,
  companyName = "Company",
  className = "",
  size = "sm",
  initialStatus = null, // Server-fetched status to avoid client-side delay
}) {
  const { user } = useUser();
  const [hasAcceptedRequest, setHasAcceptedRequest] = useState(
    initialStatus?.hasAcceptedRequest || initialStatus?.hasConversation || false
  );
  const [hasPendingRequest, setHasPendingRequest] = useState(
    initialStatus?.hasPendingRequest || false
  );
  const [isLoading, setIsLoading] = useState(initialStatus === null);

  const checkInteractionStatus = async () => {
    if (!user?.id || !companyTenantId) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if there's an accepted event request or existing conversation
      const response = await fetch(
        `/api/company-interaction-status?companyTenantId=${companyTenantId}`
      );

      if (response.ok) {
        const data = await response.json();
        setHasAcceptedRequest(data.hasAcceptedRequest || data.hasConversation);
        setHasPendingRequest(data.hasPendingRequest);
      }
    } catch (error) {
      console.error("Error checking interaction status:", error);
      // Default to showing event request button on error
      setHasAcceptedRequest(false);
      setHasPendingRequest(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Skip client-side fetch if status was provided from server
    if (initialStatus !== null) return;
    checkInteractionStatus();
  }, [user?.id, companyTenantId, initialStatus]);

  // Show loading state while checking status
  if (isLoading) {
    return <Skeleton className={`inline-flex h-9 w-[120px] ${className}`} />;
  }

  // Show message button if there's an accepted request or existing conversation
  if (hasAcceptedRequest) {
    return (
      <MessageCompanyButton
        companyTenantId={companyTenantId}
        className={className}
        size={size}
      />
    );
  }

  // Show waiting state if there's a pending request
  if (hasPendingRequest) {
    return (
      <WaitingForResponseButton
        className={className}
        variant="outline"
        size={size}
      />
    );
  }

  // Show order request button for first-time interactions
  return (
    <OrderRequestButton
      companyTenantId={companyTenantId}
      companyName={companyName}
      className={className}
      size={size}
      onRequestSubmitted={() => {
        setHasPendingRequest(true);
        setHasAcceptedRequest(false);
      }}
    />
  );
}
