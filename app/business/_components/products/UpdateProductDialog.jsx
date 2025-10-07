"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import ProductForm from "./ProductForm";

export default function UpdateProductDialog({ product, onUpdated, trigger }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);

    try {
      // Prepare form data for multipart upload
      const form = new FormData();

      // Prepare product data
      const productData = {
        id: product._id,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        quantity: formData.quantity,
        currency: formData.currency,
        weightUnit: formData.weightUnit,
      };

      form.append("json", JSON.stringify(productData));

      // Handle image upload if it's a new file
      if (formData.image && formData.image instanceof File) {
        form.append("file", formData.image);
      }

      const response = await fetch("/api/products/update", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "فشل في تحديث المنتج");
      }

      const result = await response.json();

      toast.success("تم تحديث المنتج بنجاح", {
        description: `تم تحديث "${formData.title}" بنجاح`,
      });

      setOpen(false);
      // Pass the updated product data including the new image to the parent component
      if (onUpdated) onUpdated(result.product);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("فشل في تحديث المنتج", {
        description: error.message || "حدث خطأ أثناء تحديث المنتج",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      setOpen(false);
    }
  };

  // Prepare initial values for the form
  const initialValues = {
    title: product.title || "",
    description: product.description?.[0]?.children?.[0]?.text || "",
    price: product.price?.toString() || "",
    quantity: product.quantity?.toString() || "",
    currency: product.currency || "SAR",
    weightUnit: product.weightUnit || "kg",
    // Pass the full image object with asset reference for ImageUploader
    image: product.image || null,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 cursor-pointer h-12 md:h-10"
          >
            <Pencil className="h-4 w-4 ml-2" />
            تعديل
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">تعديل المنتج</DialogTitle>
        </DialogHeader>
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          initialValues={initialValues}
        />
      </DialogContent>
    </Dialog>
  );
}
