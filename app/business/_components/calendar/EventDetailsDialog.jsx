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
  Clock,
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
    return new Date(date).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("ar-EG", {
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
        toast.success("تم حذف الحدث بنجاح", { id: toastId });
        onDelete();
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to delete event");
        }
        toast.error("فشل في حذف الحدث", { id: toastId });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error deleting event:", error);
      }
      toast.error("حدث خطأ أثناء حذف الحدث");
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
        toast.success("تم تحديث الحالة بنجاح", { id: toastId });
        onUpdate();
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to update status");
        }
        toast.error("فشل في تحديث الحالة", { id: toastId });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error updating status:", error);
      }
      toast.error("حدث خطأ أثناء تحديث الحالة");
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
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader className="space-y-4 pb-6 border-b">
          <div className="w-full flex items-start sm:flex-row flex-col justify-center sm:justify-between gap-4 sm:gap-0">
            <div className="space-y-3 flex flex-col w-full">
              <DialogTitle className="text-2xl font-bold text-center">
                {event.title}
              </DialogTitle>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={`${getStatusColor(event.status)} text-base px-3 py-1`}
                  >
                    {statusOptions.find((opt) => opt.value === event.status)
                      ?.label || event.status}
                  </Badge>
                  {event.priority && (
                    <Badge
                      className={`${getPriorityColor(event.priority)} text-base px-3 py-1`}
                    >
                      <span className="ms-1">🔔</span>
                      {priorityOptions.find(
                        (opt) => opt.value === event.priority
                      )?.label || event.priority}
                    </Badge>
                  )}
                </div>
                <div className="hidden sm:flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(event)}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4 ms-1" />
                    تعديل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 ms-1" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف
                          الحدث "{event.title}" وجميع البيانات المرتبطة به
                          نهائياً.
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
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6" dir="rtl">
          {/* Quick Status Update */}
          <div className="bg-gradient-to-l from-primary/5 to-transparent p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <label className="text-base font-semibold">تحديث الحالة:</label>
              </div>
              <Select
                value={event.status}
                onValueChange={handleStatusUpdate}
                disabled={updatingStatus}
                dir="rtl"
              >
                <SelectTrigger className="w-48 h-11">
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
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              التاريخ والوقت
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date/Time */}
              <div className="flex flex-col gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    بداية الحجز
                  </p>
                </div>
                <div className="pr-4 space-y-1">
                  <p className="font-bold text-base">
                    {formatDate(event.startDate)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(event.startDate)}
                  </p>
                </div>
              </div>

              {/* End Date/Time */}
              <div className="flex flex-col gap-2 p-4 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                    نهاية الحجز
                  </p>
                </div>
                <div className="pr-4 space-y-1">
                  <p className="font-bold text-base">
                    {formatDate(event.endDate)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(event.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description and Location */}
          {(event.description || event.location) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Description */}
              {event.description && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    الوصف
                  </h3>
                  <p className="text-sm text-muted-foreground pr-6 whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    الموقع
                  </h3>
                  <p className="text-sm pr-6 font-medium">{event.location}</p>
                </div>
              )}
            </div>
          )}

          {/* Client Information */}
          {event.clientContact &&
            (event.clientContact.name ||
              event.clientContact.email ||
              event.clientContact.phone) && (
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg border-r-4 border-primary">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  معلومات العميل
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-2">
                  {event.clientContact.name && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          الاسم
                        </span>
                        <span className="text-sm font-medium">
                          {event.clientContact.name}
                        </span>
                      </div>
                    </div>
                  )}
                  {event.clientContact.email && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          البريد
                        </span>
                        <a
                          href={`mailto:${event.clientContact.email}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                          dir="ltr"
                        >
                          {event.clientContact.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {event.clientContact.phone && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          الهاتف
                        </span>
                        <a
                          href={`tel:${event.clientContact.phone}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                          dir="ltr"
                        >
                          {event.clientContact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Event Metadata */}
          <div className="flex flex-row items-center justify-between pt-4 border-t">
            <div className="space-y-2 bg-muted/20 p-3 rounded-md">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>📅</span>
                <span className="font-medium">تاريخ الإنشاء:</span>
                {new Date(
                  event._createdAt || event.createdAt || Date.now()
                ).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {event._updatedAt && event._updatedAt !== event._createdAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>🔄</span>
                  <span className="font-medium">آخر تحديث:</span>
                  {new Date(event._updatedAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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
                <Edit className="w-4 h-4 ms-1" />
                تعديل
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 ms-1 text-destructive" />
                    حذف
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
