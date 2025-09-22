"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function OfferActions({
  offer,
  pending,
  onToggleStatus,
  onDelete,
  className = "",
}) {
  const isExpired = (() => {
    if (!offer.endDate) return false;
    const end = new Date(offer.endDate);
    end.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end <= today;
  })();
  const isDisabled = pending.id === offer._id;
  const cannotActivate = offer.status !== "active" && isExpired;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "transition-all duration-200 hover:bg-gray-100 cursor-pointer h-10 w-10 md:h-8 md:w-8",
            isDisabled && "cursor-not-allowed",
            className
          )}
          title="More actions"
          disabled={isDisabled}
        >
          {isDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 cursor-pointer h-12 md:h-10",
                cannotActivate && "opacity-60 cursor-not-allowed"
              )}
              disabled={isDisabled || cannotActivate}
              title={
                cannotActivate
                  ? "Cannot activate: offer end date has passed"
                  : undefined
              }
            >
              {offer.status === "active" ? "Deactivate" : "Activate"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {offer.status === "active"
                  ? "Deactivate offer?"
                  : "Activate offer?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {offer.status === "active"
                  ? "This offer will become inactive and may be auto-deleted after 3 days."
                  : isExpired
                    ? `This offer ended on ${format(new Date(offer.endDate), "PP")}. It cannot be reactivated.`
                    : "This offer will be visible as active."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isDisabled}
                className="cursor-pointer h-12 md:h-10"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  onToggleStatus(offer._id, offer.status, {
                    endDate: offer.endDate,
                  })
                }
                disabled={isDisabled || cannotActivate}
                className="cursor-pointer h-12 md:h-10"
              >
                {isDisabled && pending.type === "toggle" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Working...
                  </span>
                ) : (
                  "Confirm"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer h-12 md:h-10"
              disabled={isDisabled}
              title="Delete offer permanently"
            >
              <span className="inline-flex items-center gap-2">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                ⚠️ Delete offer permanently?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <div>
                  This action cannot be undone. The offer will be permanently
                  removed from your dashboard and will no longer be visible to
                  potential clients.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isDisabled}
                className="hover:bg-gray-50 cursor-pointer h-12 md:h-10"
              >
                Keep offer
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(offer._id)}
                disabled={isDisabled}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer h-12 md:h-10"
              >
                {isDisabled && pending.type === "delete" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    🗑️ Delete permanently
                  </span>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PopoverContent>
    </Popover>
  );
}
