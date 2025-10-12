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
import { ShoppingCart } from "lucide-react";
import OrderRequestForm from "./order-request/OrderRequestForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function OrderRequestButton({
  companyTenantId,
  companyName = "Company",
  className = "",
  size = "sm",
  onRequestSubmitted,
  onRequestAccepted,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const handleButtonClick = () => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      const signInUrl = new URL("/sign-in", window.location.origin);
      signInUrl.searchParams.set("redirect_url", window.location.href);
      router.push(signInUrl.toString());
      return;
    }

    setIsOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (!companyTenantId) {
      toast.error("المعلومات الشركية مفقودة");
      return;
    }

    setIsLoading(true);

    try {
      const orderRequestData = {
        title: `طلب تمور من ${companyName}`,
        fullName: formData.fullName,
        deliveryDate: formData.deliveryDate,
        quantity: formData.quantity,
        category: formData.category,
        deliveryAddress: formData.deliveryAddress,
        targetCompanyTenantId: companyTenantId,
      };

      // Only add additionalNotes if it's not empty
      if (formData.additionalNotes) {
        orderRequestData.additionalNotes = formData.additionalNotes;
      }

      const response = await fetch("/api/order-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequestData),
      });

      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit order request");
      }

      toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريباً");
      setIsOpen(false);

      onRequestSubmitted?.();
      onRequestAccepted?.();
    } catch (error) {
      console.error("Error submitting order request:", error);
      toast.error("فشل إرسال الطلب. يرجى المحاولة مرة أخرى.");
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
          size={size}
          className={`cursor-pointer bg-button-1 hover:bg-button-1-hover text-white ${className}`}
          onClick={handleButtonClick}
          disabled={!isLoaded}
        >
          <ShoppingCart className="size-4 mr-2" />
          {!isLoaded ? "جارٍ التحميل..." : "اطلب الآن"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            اطلب تمورك من {companyName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <OrderRequestForm
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
