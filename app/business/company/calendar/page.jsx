import EventCalendar from "@/app/business/_components/calendar/EventCalendar";

export const metadata = {
  title: "الحجوزات - لوحة تحكم الشركة",
  description: "إدارة الحجوزات الخاصة بك",
};

export default function CompanyCalendarPage() {
  return <EventCalendar />;
}
