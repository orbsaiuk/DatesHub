"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function UpgradeConfirmDialog({
  plan,
  isOpen,
  onClose,
  onConfirm,
  loading,
  formatPrice,
  billingInterval,
  canUpgrade,
}) {
  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95%] max-w-[425px] rounded-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg sm:text-xl">
            Confirm Plan Change
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Are you sure you want to {canUpgrade(plan) ? "upgrade" : "change"}{" "}
            to the {plan.name} plan?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">New Plan:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Price:</span>
              <span className="font-medium">
                {formatPrice(
                  plan.price?.amount || 0,
                  plan.price?.currency,
                  billingInterval
                )}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer touch-manipulation h-12 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(plan._id, plan.name, plan.stripePriceId)}
            disabled={loading}
            className="cursor-pointer touch-manipulation h-12 w-full sm:w-auto"
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
