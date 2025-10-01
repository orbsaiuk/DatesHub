"use client";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isAfter } from "date-fns";
import { ar } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import EventDialog from "./EventDialog";
import EventDetailsDialog from "./EventDetailsDialog";

// Setup date-fns localizer with Arabic locale
const locales = {
  ar: ar,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const eventStyleGetter = (event) => {
  let backgroundColor = "#3174ad"; // default
  let color = "white";

  if (event.priority) {
    switch (event.priority) {
      case "low":
        backgroundColor = "#10b981";
        break;
      case "medium":
        backgroundColor = "#3b82f6";
        break;
      case "high":
        backgroundColor = "#f59e0b";
        break;
      case "urgent":
        backgroundColor = "#ef4444";
        break;
      default:
        backgroundColor = "#3174ad";
    }
  }

  if (event.status === "cancelled") {
    backgroundColor = "#ef4444";
  } else if (event.status === "completed") {
    backgroundColor = "#22c55e";
  }

  return {
    style: {
      backgroundColor,
      color,
      border: "none",
      borderRadius: "4px",
      fontSize: "12px",
      padding: "2px 4px",
    },
  };
};

const EventComponent = ({ event }) => {
  const statusColors = {
    planned: "bg-gray-100 text-gray-800",
    confirmed: "bg-indigo-100 text-indigo-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusTranslations = {
    planned: "مخطط",
    confirmed: "مؤكد",
    "in-progress": "جاري",
    completed: "مكتمل",
    cancelled: "ملغى",
  };

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1 p-0.5 sm:p-1"
      dir="rtl"
    >
      <span className="truncate capitalize font-medium flex-1 min-w-0 text-[11px] sm:text-[13px]">
        {event.title}
      </span>
      {event.status && (
        <Badge
          variant="secondary"
          className={`${statusColors[event.status] || "bg-gray-100 text-gray-800"} 
            px-1.5 sm:px-2 py-0 text-[9px] sm:text-[10px] leading-tight shrink-0 whitespace-nowrap 
            rounded-sm sm:rounded font-medium`}
        >
          {statusTranslations[event.status] || event.status}
        </Badge>
      )}
    </div>
  );
};

export default function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  const onView = useCallback(
    (newView) => setCurrentView(newView),
    [setCurrentView]
  );

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map((event) => ({
          ...event,
          id: event._id,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
        }));
        setEvents(formattedEvents);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch events");
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching events:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectSlot = (slotInfo) => {
    const { start, end, slots } = slotInfo || {};

    let normalizedStart = start;
    let normalizedEnd = end;

    if (Array.isArray(slots) && slots.length > 0) {
      const slotDates = slots.map((s) => new Date(s).getTime());
      const minTime = Math.min(...slotDates);
      const maxTime = Math.max(...slotDates);
      normalizedStart = new Date(minTime);
      normalizedEnd = new Date(maxTime);
    } else {
      // fallback: swap if start > end
      if (isAfter(start, end)) {
        normalizedStart = end;
        normalizedEnd = start;
      }
    }

    setSelectedSlot({ start: normalizedStart, end: normalizedEnd });
    setSelectedEvent(null);
    setShowEventDialog(true);
  };
  // ------------------------------------------------------

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEventSaved = () => {
    fetchEvents();
    setShowEventDialog(false);
    setSelectedSlot(null);
  };

  const handleEventUpdated = () => {
    fetchEvents();
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleEventDeleted = () => {
    fetchEvents();
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setShowEventDetails(false);
    setShowEventDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 lg:h-80 p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary"></div>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            جاري تحميل الحجوزات...
          </p>
        </div>
      </div>
    );
  }

  return (
    // Add dir="rtl" to the wrapper so the browser pointer coordinates match visual RTL layout
    <div
      className="w-full max-w-full space-y-2 sm:space-y-4 p-2 sm:p-4"
      dir="rtl"
    >
      {/* Header Section */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
            تقويم الفعاليات
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            إدارة فعالياتك ومواعيدك
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedSlot(null);
            setSelectedEvent(null);
            setShowEventDialog(true);
          }}
          className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base px-4 py-2 sm:px-6 cursor-pointer"
          size="default"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 ms-2" />
          <span className="font-medium">فعالية جديدة</span>
        </Button>
      </div>

      {/* Calendar */}
      <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[320px] p-2 sm:p-4">
            <div
              className="w-full h-[360px] sm:h-[520px] md:h-[620px] lg:h-[720px]"
              style={{ minHeight: "350px" }}
            >
              <Calendar
                localizer={localizer}
                events={events}
                culture="ar"
                startAccessor="start"
                endAccessor="end"
                selectable
                rtl
                elementProps={{ dir: "rtl" }}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                messages={{
                  allDay: "طوال اليوم",
                  previous: "السابق",
                  next: "التالي",
                  today: "اليوم",
                  month: "شهر",
                  week: "أسبوع",
                  day: "يوم",
                  agenda: "جدول الأعمال",
                  date: "التاريخ",
                  time: "الوقت",
                  event: "حدث",
                  noEventsInRange: "لا توجد أحداث في هذا النطاق",
                  showMore: (total) => `+${total} المزيد`,
                }}
                components={{
                  event: EventComponent,
                  toolbar: ({ label, onNavigate, onView }) => (
                    <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => onNavigate("PREV")}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                        >
                          ‹
                        </button>
                        <span className="px-4 text-sm sm:text-base font-medium">
                          {label}
                        </span>
                        <button
                          onClick={() => onNavigate("NEXT")}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                        >
                          ›
                        </button>
                      </div>
                      <div className="flex justify-center sm:justify-end">
                        <div className="flex bg-gray-100 rounded p-1" dir="rtl">
                          {[
                            { key: "month", label: "شهر" },
                            { key: "week", label: "أسبوع" },
                            { key: "day", label: "يوم" },
                            { key: "agenda", label: "جدول" },
                          ].map((view) => (
                            <button
                              key={view.key}
                              onClick={() => onView(view.key)}
                              className={`px-2 py-1 text-xs sm:text-sm rounded ${
                                currentView === view.key
                                  ? "bg-white shadow-sm font-medium"
                                  : "hover:bg-gray-200 cursor-pointer"
                              }`}
                            >
                              {view.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ),
                }}
                views={["month", "week", "day", "agenda"]}
                view={currentView}
                onView={onView}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                style={{ height: "100%", width: "100%" }}
                popup
                tooltipAccessor={(event) => `${event.title}`}
                longPressThreshold={300}
                dayLayoutAlgorithm="no-overlap"
                popupOffset={{ x: 10, y: 10 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event Dialogs */}
      <EventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        event={selectedEvent}
        initialSlot={selectedSlot}
        onSave={handleEventSaved}
      />

      <EventDetailsDialog
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleEventDeleted}
        onUpdate={handleEventUpdated}
      />
    </div>
  );
}
