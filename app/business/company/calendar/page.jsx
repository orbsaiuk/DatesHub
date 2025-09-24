import EventCalendar from "@/app/business/_components/calendar/EventCalendar";

export const metadata = {
  title: "التقويم - لوحة تحكم الشركة",
  description: "إدارة فعالياتك ومواعيدك",
};

export default function CompanyCalendarPage() {
  return <EventCalendar />;
}
