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
import { cn } from "@/lib/utils";
import UpdateProductDialog from "./UpdateProductDialog";

export default function ProductActions({
  product,
  pending,
  onDelete,
  onUpdated,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const isDisabled = pending.id === product._id;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 rounded-full cursor-pointer h-10 w-10 md:h-8 md:w-8",
            isDisabled && "cursor-not-allowed",
            className
          )}
          title="المزيد من الإجراءات"
          disabled={isDisabled}
          aria-label="خيارات المنتج"
        >
          {isDisabled ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : (
            <MoreVertical className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-1 rounded-xl">
        <UpdateProductDialog
          product={product}
          onUpdated={(updatedProduct) => {
            setOpen(false);
            onUpdated(updatedProduct);
          }}
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors duration-200 cursor-pointer h-14 md:h-10 text-base"
              disabled={isDisabled}
              title="حذف المنتج نهائياً"
            >
              <span className="inline-flex items-center gap-2">حذف</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                ⚠️ حذف المنتج نهائياً؟
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2 text-right">
                <div>
                  لا يمكن التراجع عن هذا الإجراء. سيتم حذف المنتج "
                  {product.title}" نهائياً من لوحة التحكم.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 flex-col sm:flex-row">
              <AlertDialogCancel
                disabled={isDisabled}
                className="hover:bg-gray-50 active:bg-gray-100 cursor-pointer h-12 md:h-10 w-full sm:w-auto order-1 sm:order-none"
              >
                الاحتفاظ بالمنتج
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setOpen(false);
                  onDelete(product._id);
                }}
                disabled={isDisabled}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer h-12 md:h-10 w-full sm:w-auto"
              >
                {isDisabled && pending.type === "delete" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
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
