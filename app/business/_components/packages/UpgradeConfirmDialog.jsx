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
}) {
  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95%] max-w-[425px] rounded-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg sm:text-xl">
            تأكيد تغيير الباقة
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            هل أنت متأكد من أنك تريد الترقية إلى باقة {plan.name}؟
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">الباقة الجديدة:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">السعر:</span>
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

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer touch-manipulation h-12 w-full sm:w-auto"
          >
            إلغاء
          </Button>
          <Button
            onClick={() => onConfirm(plan._id, plan.name, plan.stripePriceId)}
            disabled={loading}
            className="cursor-pointer touch-manipulation h-12 w-full sm:w-auto"
          >
            {loading ? "جاري المعالجة..." : "تأكيد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
