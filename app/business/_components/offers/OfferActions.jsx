"use client";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "transition-all duration-200 hover:bg-gray-100 cursor-pointer h-10 w-10 md:h-8 md:w-8",
            isDisabled && "cursor-not-allowed",
            className
          )}
          title="المزيد من الإجراءات"
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
                  ? "لا يمكن التفعيل: انتهت صلاحية العرض"
                  : undefined
              }
            >
              {offer.status === "active" ? "إلغاء التفعيل" : "تفعيل"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {offer.status === "active"
                  ? "إلغاء تفعيل العرض؟"
                  : "تفعيل العرض؟"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {offer.status === "active"
                  ? "سيصبح هذا العرض غير نشط وقد يتم حذفه تلقائياً بعد 3 أيام."
                  : isExpired
                    ? `انتهى هذا العرض في ${format(new Date(offer.endDate), "PP")}. لا يمكن إعادة تفعيله.`
                    : "سيظهر هذا العرض كنشط."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isDisabled}
                className="cursor-pointer h-12 md:h-10"
              >
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setOpen(false);
                  onToggleStatus(offer._id, offer.status, {
                    endDate: offer.endDate,
                  });
                }}
                disabled={isDisabled || cannotActivate}
                className="cursor-pointer h-12 md:h-10"
              >
                {isDisabled && pending.type === "toggle" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري العمل...
                  </span>
                ) : (
                  "تأكيد"
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
              title="حذف العرض نهائياً"
            >
              <span className="inline-flex items-center gap-2">حذف</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                ⚠️ حذف العرض نهائياً؟
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2 text-right">
                <div>
                  لا يمكن التراجع عن هذا الإجراء. سيتم حذف العرض نهائياً من لوحة
                  التحكم ولن يكون مرئياً للعملاء المحتملين.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isDisabled}
                className="hover:bg-gray-50 cursor-pointer h-12 md:h-10"
              >
                الاحتفاظ بالعرض
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setOpen(false);
                  onDelete(offer._id);
                }}
                disabled={isDisabled}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer h-12 md:h-10"
              >
                {isDisabled && pending.type === "delete" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحذف...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    🗑️ حذف نهائياً
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
