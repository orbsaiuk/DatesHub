"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DirectoryReviewsContent from "./accordions/DirectoryReviewsContent";
import DirectoryWorkAwardsContent from "./accordions/DirectoryWorkAwardsContent";
import DirectoryLocationContent from "./accordions/DirectoryLocationContent";
import DirectoryContactContent from "./accordions/DirectoryContactContent";

export default function DirectoryAccordions({
  reviews = [],
  projects = [],
  works = [],
  awards = [],
  tenant,
  isSupplier = false,
}) {
  const DEFAULT_KEYS = ["location", "contact"];
  const EXTRA_KEYS = ["reviews", "work-awards"];
  const initialKeys = isSupplier
    ? DEFAULT_KEYS
    : [...EXTRA_KEYS, ...DEFAULT_KEYS];
  const [openItems, setOpenItems] = React.useState(initialKeys);
  return (
    <div className="mt-6">
      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="w-full overflow-hidden rounded-xl border bg-white shadow-sm"
      >
        {!isSupplier && (
          <>
            <AccordionItem value="reviews">
              <AccordionTrigger className="px-4 sm:px-6 font-bold text-lg">
                التقييمات
              </AccordionTrigger>
              <AccordionContent className="px-4 sm:px-6">
                <DirectoryReviewsContent
                  isOpen={
                    Array.isArray(openItems) && openItems.includes("reviews")
                  }
                  reviews={reviews}
                  companyId={tenant?.id}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="work-awards">
              <AccordionTrigger className="px-4 sm:px-6 font-bold text-lg">
                أعمالنا والجوائز
              </AccordionTrigger>
              <AccordionContent className="px-4 sm:px-6">
                <DirectoryWorkAwardsContent
                  works={works.length ? works : projects}
                  awards={awards}
                />
              </AccordionContent>
            </AccordionItem>
          </>
        )}

        <AccordionItem value="location">
          <AccordionTrigger className="px-4 sm:px-6 font-bold text-lg">
            الموقع
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6">
            <DirectoryLocationContent tenant={tenant} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact" id="contact-section">
          <AccordionTrigger className="px-4 sm:px-6 font-bold text-lg">
            التواصل
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6">
            <DirectoryContactContent tenant={tenant} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
