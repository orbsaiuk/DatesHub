"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const statusOptions = [
  { value: "planned", label: "Planned" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function EventDialog({
  open,
  onOpenChange,
  event,
  initialSlot,
  onSave,
}) {
  const [loading, setLoading] = useState(false);
  const eventSchema = z
    .object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      startDate: z.string().min(1, "Start date is required"),
      startTime: z
        .string()
        .min(1, "Start time is required")
        .regex(/^\d{2}:\d{2}$/g, "Invalid time format"),
      endDate: z.string().min(1, "End date is required"),
      endTime: z
        .string()
        .min(1, "End time is required")
        .regex(/^\d{2}:\d{2}$/g, "Invalid time format"),
      location: z.string().optional(),
      status: z.enum([
        "planned",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
      ]),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      clientName: z.string().optional(),
      clientEmail: z
        .string()
        .email("Invalid email")
        .optional()
        .or(z.literal("")),
      clientPhone: z.string().optional(),
    })
    .refine(
      (data) => {
        // Prevent end selection without start
        if (!data.startDate || !data.startTime) return false;
        const start = new Date(`${data.startDate}T${data.startTime}:00`);
        const end = new Date(`${data.endDate}T${data.endTime}:00`);
        return end.getTime() > start.getTime();
      },
      {
        message: "End must be after start",
        path: ["endTime"],
      }
    );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(eventSchema) });

  const startDateVal = watch("startDate");
  const startTimeVal = watch("startTime");
  const endDateVal = watch("endDate");

  useEffect(() => {
    if (open) {
      if (event) {
        // Editing existing event
        reset({
          title: event.title || "",
          description: event.description || "",
          startDate: formatDateForInput(event.start || event.startDate),
          startTime: formatTimeForInput(event.start || event.startDate),
          endDate: formatDateForInput(event.end || event.endDate),
          endTime: formatTimeForInput(event.end || event.endDate),
          location: event.location || "",
          status: event.status || "planned",
          priority: event.priority || "medium",
          clientName: event.clientContact?.name || "",
          clientEmail: event.clientContact?.email || "",
          clientPhone: event.clientContact?.phone || "",
        });
      } else if (initialSlot) {
        // Creating new event from slot selection
        reset({
          title: "",
          description: "",
          startDate: formatDateForInput(initialSlot.start),
          startTime: formatTimeForInput(initialSlot.start),
          endDate: formatDateForInput(initialSlot.end),
          endTime: formatTimeForInput(initialSlot.end),
          location: "",
          status: "planned",
          priority: "medium",
          clientName: "",
          clientEmail: "",
          clientPhone: "",
        });
      } else {
        // Creating new event manually - default to empty date/time fields
        reset({
          title: "",
          description: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          location: "",
          status: "planned",
          priority: "medium",
          clientName: "",
          clientEmail: "",
          clientPhone: "",
        });
      }
    }
  }, [open, event, initialSlot, reset]);

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Use local date, not UTC
  };

  const formatTimeForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toTimeString().slice(0, 5);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const toastId = toast.loading(
        event ? "Updating event…" : "Creating event…"
      );

      // Combine date and time
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);

      const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);

      const eventData = {
        title: data.title,
        description: data.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: data.location,
        status: data.status,
        priority: data.priority,
        clientContact:
          data.clientName || data.clientEmail || data.clientPhone
            ? {
                name: data.clientName || undefined,
                email: data.clientEmail || undefined,
                phone: data.clientPhone || undefined,
              }
            : null,
      };

      const url = event
        ? `/api/events/${event.id || event._id}`
        : "/api/events";
      const method = event ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        toast.success(event ? "Event updated" : "Event created", {
          id: toastId,
        });
        onSave();
      } else {
        console.error("Failed to save event");
        toast.error("Failed to save event", { id: toastId });
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Error saving event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Event description..."
                rows={3}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input id="startTime" type="time" {...register("startTime")} />
                {errors.startTime && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  min={startDateVal || undefined}
                  disabled={!startDateVal || !startTimeVal}
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endDate.message}
                  </p>
                )}
                {!startDateVal || !startTimeVal ? (
                  <p className="text-xs text-muted-foreground">
                    Set start date and time first
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">
                  End Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  disabled={!startDateVal || !startTimeVal || !endDateVal}
                  {...register("endTime")}
                />
                {errors.endTime && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(value) => setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Event location"
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Client Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  {...register("clientName")}
                  placeholder="Client name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  {...register("clientEmail")}
                  placeholder="client@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  {...register("clientPhone")}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
