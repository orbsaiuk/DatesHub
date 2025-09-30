"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  FileText,
  X,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "planned", label: "مخطط", color: "bg-blue-100 text-blue-800" },
  {
    value: "confirmed",
    label: "مؤكد",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "in-progress",
    label: "جاري",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "completed",
    label: "مكتمل",
    color: "bg-emerald-100 text-emerald-800",
  },
  { value: "cancelled", label: "ملغى", color: "bg-red-100 text-red-800" },
];

const priorityOptions = [
  { value: "low", label: "منخفض", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "متوسط", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "عالي", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "عاجل", color: "bg-red-100 text-red-800" },
];

export default function EventDetailsDialog({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
  onUpdate,
}) {
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!event) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const toastId = toast.loading("جاري حذف الحدث...");
      const response = await fetch(`/api/events/${event.id || event._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("تم حذف الحدث", { id: toastId });
        onDelete();
      } else {
        console.error("Failed to delete event");
        toast.error("فشل في حذف الحدث", { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("خطأ في حذف الحدث");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const toastId = toast.loading("جاري تحديث الحالة...");
      const response = await fetch(`/api/events/${event.id || event._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, status: newStatus }),
      });

      if (response.ok) {
        toast.success("تم تحديث الحالة", { id: toastId });
        onUpdate();
      } else {
        console.error("Failed to update status");
        toast.error("فشل في تحديث الحالة", { id: toastId });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("خطأ في تحديث الحالة");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const option = priorityOptions.find((opt) => opt.value === priority);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="w-full flex items-start sm:flex-row flex-col justify-center sm:justify-between gap-2 sm:gap-0 mt-6">
            <div className="space-y-2 flex flex-row sm:flex-col justify-between w-full">
              <DialogTitle className="text-xl capitalize">
                {event.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(event.status)}>
                  {statusOptions.find((opt) => opt.value === event.status)
                    ?.label || event.status}
                </Badge>
                <Badge className={getPriorityColor(event.priority)}>
                  {priorityOptions.find((opt) => opt.value === event.priority)
                    ?.label || event.priority}{" "}
                  Priority
                </Badge>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(event)}
                className="cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف الحدث "
                      {event.title}" وجميع البيانات المرتبطة به نهائياً.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      إلغاء
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "جاري الحذف..." : "حذف الحدث"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6" dir="rtl">
          {/* Quick Status Update */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">تحديث الحالة:</label>
              <Select
                value={event.status}
                onValueChange={handleStatusUpdate}
                disabled={updatingStatus}
                dir="rtl"
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              التاريخ والوقت
            </h3>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 pr-0 md:pr-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                <p className="text-sm text-muted-foreground font-medium min-w-[60px]">
                  البداية:
                </p>
                <div className="flex flex-row items-center gap-1 sm:gap-2">
                  <span className="font-medium text-sm">
                    {formatDate(event.startDate)}
                  </span>
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    ({formatTime(event.startDate)})
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                <p className="text-sm text-muted-foreground font-medium min-w-[60px]">
                  النهاية:
                </p>
                <div className="flex flex-row items-center gap-1 sm:gap-2">
                  <span className="font-medium text-sm">
                    {formatDate(event.endDate)}
                  </span>
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    ({formatTime(event.endDate)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y py-4">
            {/* Description */}
            {event.description && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  الوصف
                </h3>
                <p className="text-sm text-muted-foreground pr-6 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  الموقع
                </h3>
                <p className="text-sm pr-6">{event.location}</p>
              </div>
            )}
          </div>

          {/* Client Information */}
          {event.clientContact &&
            (event.clientContact.name ||
              event.clientContact.email ||
              event.clientContact.phone) && (
              <div className="space-y-3 border-b pb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  معلومات العميل
                </h3>
                <div className="space-y-2 pr-6">
                  {event.clientContact.name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {event.clientContact.name}
                      </span>
                    </div>
                  )}
                  {event.clientContact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`mailto:${event.clientContact.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {event.clientContact.email}
                      </a>
                    </div>
                  )}
                  {event.clientContact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`tel:${event.clientContact.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {event.clientContact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Event Metadata */}
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Created:{" "}
                {new Date(
                  event._createdAt || event.createdAt || Date.now()
                ).toLocaleDateString("en-GB")}
              </p>
              {event._updatedAt !== event._createdAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated:{" "}
                  {new Date(event._updatedAt).toLocaleDateString("en-GB")}
                </p>
              )}
            </div>
            <div className="flex sm:hidden gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(event)}
                className="cursor-pointer"
              >
                <Edit className="w-4 h-4 mr-1" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(event)}
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the event "{event.title}" and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete Event"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
