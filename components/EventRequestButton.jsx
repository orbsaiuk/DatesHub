"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import EventRequestForm from "./event-request/EventRequestForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function EventRequestButton({
  companyTenantId,
  companyName = "Company",
  className = "",
  variant = "default",
  size = "sm",
  onRequestSubmitted, // Called when request is submitted
  onRequestAccepted, // Legacy support - called when request is submitted for now
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const handleButtonClick = () => {
    // Check if user is signed in before opening the dialog
    if (!isLoaded) {
      // Still loading user state, wait
      return;
    }

    if (!isSignedIn) {
      // User is not signed in, redirect to sign-in page
      const signInUrl = new URL("/sign-in", window.location.origin);
      signInUrl.searchParams.set("redirect_url", window.location.href);
      router.push(signInUrl.toString());
      return;
    }

    // User is signed in, open the dialog
    setIsOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (!companyTenantId) {
      toast.error("المعلومات الشركية مفقودة");
      return;
    }

    setIsLoading(true);

    try {
      // Create event request
      const eventRequestData = {
        title: `Event Request for ${companyName}`,
        fullName: formData.fullName,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        numberOfGuests: formData.numberOfGuests,
        category: formData.category,
        serviceRequired: formData.serviceRequired,
        eventLocation: formData.eventLocation,
        eventDescription: formData.eventDescription,
        targetCompanyTenantId: companyTenantId,
        priority: "medium",
      };

      const response = await fetch("/api/event-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventRequestData),
      });

      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit event request");
      }

      toast.success("طلب الحدث تم إرساله بنجاح!");
      setIsOpen(false);

      // Call the callbacks if provided
      onRequestSubmitted?.();
      onRequestAccepted?.();
    } catch (error) {
      console.error("Error submitting event request:", error);
      toast.error(
        error.message || "فشل إرسال طلب الحدث. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`cursor-pointer ${className}`}
          onClick={handleButtonClick}
          disabled={!isLoaded}
        >
          <Calendar className="size-4 mr-2" />
          {!isLoaded ? "جارٍ التحميل..." : "طلب حجز فعالية"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            طلب حجز فعالية من {companyName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <EventRequestForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            companyTenantId={companyTenantId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
