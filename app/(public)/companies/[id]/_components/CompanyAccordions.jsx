"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReviewsContent from "./accordions/ReviewsContent";
import WorkAwardsContent from "./accordions/WorkAwardsContent";
import LocationContent from "./accordions/LocationContent";
import ContactContent from "./accordions/ContactContent";

export default function CompanyAccordions({
  reviews = [],
  projects = [],
  works = [],
  awards = [],
  company,
}) {
  // Allow multiple sections open and open all by default
  const ALL_KEYS = [
    "reviews",
    "work-awards",
    "verification",
    "location",
    "contact",
  ];
  const [openItems, setOpenItems] = React.useState(ALL_KEYS);
  return (
    <div className="mt-6">
      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="w-full overflow-hidden rounded-xl border bg-white shadow-sm"
      >
        <AccordionItem value="reviews">
          <AccordionTrigger className="px-4 sm:px-6 font-bold text-lg">
            Reviews
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6">
            <ReviewsContent
              isOpen={Array.isArray(openItems) && openItems.includes("reviews")}
              reviews={reviews}
              companyId={company?.id}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="work-awards">
          <AccordionTrigger className="px-4 sm:px-6 font-bold text-lg">
            Our Work & Awards
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6">
            <WorkAwardsContent
              works={works.length ? works : projects}
              awards={awards}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger className="px-4 sm:px-6 font-bold text-lg">
            Location
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6">
            <LocationContent company={company} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact" id="contact-section">
          <AccordionTrigger className="px-4 sm:px-6 font-bold text-lg">
            Contact
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6">
            <ContactContent company={company} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
