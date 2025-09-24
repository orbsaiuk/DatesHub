"use client";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import EventDialog from "./EventDialog";
import EventDetailsDialog from "./EventDetailsDialog";

const localizer = momentLocalizer(moment);

const eventStyleGetter = (event) => {
  let backgroundColor = "#3174ad"; // default
  let color = "white";

  // Priority-based colors
  if (event.priority) {
    switch (event.priority) {
      case "low":
        backgroundColor = "#10b981"; // emerald
        break;
      case "medium":
        backgroundColor = "#3b82f6"; // blue
        break;
      case "high":
        backgroundColor = "#f59e0b"; // amber
        break;
      case "urgent":
        backgroundColor = "#ef4444"; // red
        break;
      default:
        backgroundColor = "#3174ad";
    }
  }

  // Status overrides (e.g., cancelled/completed)
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1 p-0.5 sm:p-1">
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
          {event.status.toUpperCase()}
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
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null);
    setShowEventDialog(true);
  };

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
            جاري تحميل التقويم...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-2 sm:space-y-4 p-2 sm:p-4">
      {/* Header Section - Mobile First */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
            تقويم الفعاليات
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            إدارة فعالياتك ومواعيدك
          </p>
        </div>

        {/* Mobile-friendly button */}
        <Button
          onClick={() => {
            setSelectedSlot(null);
            setSelectedEvent(null);
            setShowEventDialog(true);
          }}
          className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base px-4 py-2 sm:px-6"
          size="default"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="font-medium">فعالية جديدة</span>
        </Button>
      </div>

      {/* Calendar Container - Fully Responsive */}
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
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
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
                        <div className="flex bg-gray-100 rounded p-1">
                          {["month", "week", "day", "agenda"].map((view) => (
                            <button
                              key={view}
                              onClick={() => onView(view)}
                              className={`px-2 py-1 text-xs sm:text-sm rounded capitalize ${
                                currentView === view
                                  ? "bg-white shadow-sm font-medium"
                                  : "hover:bg-gray-200 cursor-pointer"
                              }`}
                            >
                              {view}
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

      {/* Event Creation/Edit Dialog */}
      <EventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        event={selectedEvent}
        initialSlot={selectedSlot}
        onSave={handleEventSaved}
      />

      {/* Event Details Dialog */}
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
