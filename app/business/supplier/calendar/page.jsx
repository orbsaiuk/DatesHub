import EventCalendar from "@/app/business/_components/calendar/EventCalendar";

export const metadata = {
  title: "Calendar - Supplier Dashboard",
  description: "Manage your events and appointments",
};

export default function SupplierCalendarPage() {
  return <EventCalendar />;
}
