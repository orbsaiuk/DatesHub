import EventCalendar from "@/app/business/_components/calendar/EventCalendar";

export const metadata = {
  title: "Calendar - Company Dashboard",
  description: "Manage your events and appointments",
};

export default function CompanyCalendarPage() {
  return <EventCalendar />;
}
