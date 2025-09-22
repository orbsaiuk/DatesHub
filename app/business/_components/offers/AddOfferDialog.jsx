"use client";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OfferForm from "@/app/business/_components/offers/OfferForm";

export default function AddOfferDialog({
  tenantType,
  tenantId,
  onCreated,
  triggerClassName,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    image: null,
    status: "active",
    description: "",
    startDate: "",
    endDate: "",
  });

  const isValid = useMemo(
    () =>
      form.title.trim().length > 2 &&
      form.description.trim().length > 2 &&
      form.image &&
      form.startDate &&
      form.endDate,
    [form.title, form.description, form.image, form.startDate, form.endDate]
  );
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const minEndStr = useMemo(() => {
    if (!form.startDate) return "";
    const d = new Date(form.startDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, [form.startDate]);

  async function submit() {
    if (!isValid) return;
    if (form.startDate && form.startDate < todayStr) {
      return toast.error("Start date cannot be in the past");
    }
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end <= start) {
        return toast.error("End date must be after start date");
      }
    }
    setLoading(true);
    try {
      // If image selected, send multipart/form-data
      let res;
      if (form.image) {
        const fd = new FormData();
        fd.append(
          "json",
          JSON.stringify({
            tenantType,
            tenantId,
            title: form.title,
            status: form.status,
            description: form.description,
            startDate: form.startDate,
            endDate: form.endDate,
          })
        );
        fd.append("file", form.image);
        res = await fetch("/api/offers/create", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/offers/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantType,
            tenantId,
            title: form.title,
            status: form.status,
            description: form.description,
            startDate: form.startDate,
            endDate: form.endDate,
          }),
        });
      }
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");
      toast.success("Offer created");
      setOpen(false);
      setForm({
        title: "",
        image: null,
        status: "active",
        description: "",
        startDate: "",
        endDate: "",
      });
      onCreated?.(json.offer);
    } catch (e) {
      toast.error(e.message || "Failed to create offer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>New offer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Offer</DialogTitle>
          <DialogDescription>
            Fill in details for your service offer.
          </DialogDescription>
        </DialogHeader>
        <OfferForm
          values={form}
          onChange={setForm}
          onSubmit={submit}
          onCancel={() => setOpen(false)}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
