import EventCalendar from "@/app/business/_components/calendar/EventCalendar";

export const metadata = {
  title: "الحجوزات - لوحة تحكم المورد",
  description: "إدارة الحجوزات الخاصة بك",
};

export default function SupplierCalendarPage() {
  return <EventCalendar />;
}
