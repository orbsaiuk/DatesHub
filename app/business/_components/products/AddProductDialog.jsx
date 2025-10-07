"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProductForm from "@/app/business/_components/products/ProductForm";
import { Plus } from "lucide-react";

export default function AddProductDialog({
    tenantType,
    tenantId,
    onCreated,
    triggerClassName,
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function submit(data) {
        setLoading(true);
        try {
            // If image selected, send multipart/form-data
            let res;
            if (data.image) {
                const fd = new FormData();
                fd.append(
                    "json",
                    JSON.stringify({
                        tenantType,
                        tenantId,
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        quantity: data.quantity,
                        currency: data.currency,
                        weightUnit: data.weightUnit,
                    })
                );
                fd.append("file", data.image);
                res = await fetch("/api/products/create", { method: "POST", body: fd });
            } else {
                res = await fetch("/api/products/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tenantType,
                        tenantId,
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        quantity: data.quantity,
                        currency: data.currency,
                        weightUnit: data.weightUnit,
                    }),
                });
            }
            const json = await res.json();
            if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");
            toast.success("تم إنشاء المنتج");
            setOpen(false);
            onCreated?.(json.product);
        } catch (e) {
            toast.error(e.message || "فشل في إنشاء المنتج");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={triggerClassName}>
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 me-2" />
                    <span className="font-medium">منتج جديد</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">منتج جديد</DialogTitle>
                    <DialogDescription className="text-center">
                        املأ التفاصيل لإضافة منتجك.
                    </DialogDescription>
                </DialogHeader>
                <ProductForm
                    onSubmit={submit}
                    onCancel={() => setOpen(false)}
                    isLoading={loading}
                />
            </DialogContent>
        </Dialog>
    );
}