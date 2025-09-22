"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import EventRequestButton from "./EventRequestButton";
import MessageCompanyButton from "./messaging/MessageCompanyButton";
import WaitingForResponseButton from "./WaitingForResponseButton";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyInteractionButton({
  companyTenantId,
  companyName = "Company",
  className = "",
  variant = "default",
  size = "sm",
}) {
  const { user } = useUser();
  const [hasAcceptedRequest, setHasAcceptedRequest] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    checkInteractionStatus();
  }, [user?.id, companyTenantId]);

  // Show loading state while checking status
  if (isLoading) {
    return <Skeleton className={`inline-flex h-9 w-[120px] ${className}`} />;
  }

  // Show message button if there's an accepted request or existing conversation
  if (hasAcceptedRequest) {
    return (
      <MessageCompanyButton
        companyTenantId={companyTenantId}
        companyName={companyName}
        className={className}
        variant={variant}
        size={size}
      />
    );
  }

  // Show waiting state if there's a pending request
  if (hasPendingRequest) {
    return (
      <WaitingForResponseButton
        companyName={companyName}
        className={className}
        variant="outline"
        size={size}
      />
    );
  }

  // Show event request button for first-time interactions
  return (
    <EventRequestButton
      companyTenantId={companyTenantId}
      companyName={companyName}
      className={className}
      variant={variant}
      size={size}
      onRequestSubmitted={() => {
        setHasPendingRequest(true);
        setHasAcceptedRequest(false);
      }}
    />
  );
}
