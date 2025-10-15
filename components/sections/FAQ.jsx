import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FAQ({ items }) {
  const faqs = Array.isArray(items) && items.length > 0 ? items : [];
  return (
    <section id="faq" className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-4xl tracking-tight mb-10">
          الأسئلة الشائعة
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full border border-section-title rounded-lg px-1 py-0 sm:px-2 sm:py-2 space-y-2"
        >
          {faqs.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="cursor-pointer text-section-title text-base sm:text-xl">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base sm:text-lg">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
