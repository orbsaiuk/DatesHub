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
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer h-12 md:h-10"
              disabled={isDisabled}
              title="حذف المنتج نهائياً"
            >
              <span className="inline-flex items-center gap-2">حذف</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
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
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isDisabled}
                className="hover:bg-gray-50 cursor-pointer h-12 md:h-10"
              >
                الاحتفاظ بالمنتج
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setOpen(false);
                  onDelete(product._id);
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
