"use client";
import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EventRequestActions({
  eventRequestId,
  onActionComplete,
  disabled = false,
}) {
  const [isResponding, setIsResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [activeAction, setActiveAction] = useState(null); // "accept" | "decline" | null

  const handleAction = async (action) => {
    if (isResponding) return;
    setActiveAction(action);
    await submitAction(action);
  };

  const submitAction = async (action) => {
    setIsResponding(true);

    try {
      const response = await fetch(
        `/api/event-requests/${eventRequestId}/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            message: responseMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          action === "accept"
            ? "Event request accepted successfully!"
            : "Event request declined"
        );

        // Reset form state
        setResponseMessage("");

        // Notify parent component
        if (onActionComplete) {
          onActionComplete(action, data.eventRequest);
        }
      } else {
        throw new Error(data.error || "Failed to process event request");
      }
    } catch (error) {
      console.error("Error processing event request:", error);
      let errorMessage = "Failed to process event request";
      if (error.message.includes("Unauthorized")) {
        errorMessage = "You don't have permission to respond to this request";
      } else if (error.message.includes("not found")) {
        errorMessage = "Event request not found";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsResponding(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {disabled && (
        <div className="text-xs text-muted-foreground">
          Your current plan doesn't allow responding to event requests.{" "}
          <a
            href="/business/company/packages"
            className="text-primary underline"
            onClick={(e) => {
              // allow normal navigation
            }}
          >
            Upgrade your plan
          </a>
          .
        </div>
      )}
      <div className="flex gap-2">
        <Button
          onClick={() => handleAction("accept")}
          disabled={disabled || isResponding}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          size="sm"
        >
          {isResponding && activeAction === "accept" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Accept
        </Button>
        <Button
          onClick={() => handleAction("decline")}
          disabled={disabled || isResponding}
          variant="destructive"
          className="flex-1 hover:bg-red-700 cursor-pointer"
          size="sm"
        >
          {isResponding && activeAction === "decline" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <X className="h-4 w-4 mr-2" />
          )}
          Decline
        </Button>
      </div>
    </div>
  );
}
