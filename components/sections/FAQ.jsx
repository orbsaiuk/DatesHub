import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const defaultFaqs = [
  {
    q: "كيف أطلب خدمة؟",
    a: "لطلب خدمة، اضغط على الخدمة المطلوبة واملأ النموذج. سيتواصل معك فريقنا في أقرب وقت.",
  },
  {
    q: "كيف أحصل على عرض سعر؟",
    a: "للحصول على عرض سعر، اضغط على الخدمة المطلوبة واملأ النموذج. سيتواصل معك فريقنا قريبًا.",
  },
  {
    q: "هل يمكنني مراسلة عدة شركات؟",
    a: "نعم، تستطيع إرسال رسالة لعدة شركات دفعة واحدة لتسريع عملية المقارنة.",
  },
];

export default function FAQ({ items }) {
  const faqs = Array.isArray(items) && items.length > 0 ? items : defaultFaqs;
  return (
    <section id="faq" className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-3xl font-semibold tracking-tight mb-6">
          الأسئلة الشائعة
        </h2>
        <Accordion type="single" collapsible className="w-full ">
          {faqs.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="cursor-pointer">
                {item.q}
              </AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
