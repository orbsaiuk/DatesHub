"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function Footer({ settings }) {
  const brandTitle = settings?.title || "العلامة";
  const description =
    settings?.description || "وصف موجز عن المنتج أو الشركة لإضافة المصداقية.";
  const footerText = settings?.footerText;
  const social = settings?.socialLinks || {};

  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile brand block */}
        <div className="md:hidden space-y-2">
          <div className="font-semibold">{brandTitle}</div>
          <p className="text-muted-foreground max-w-sm text-sm">
            {description}
          </p>
        </div>

        {/* Mobile accordion navigation */}
        <div className="md:hidden mt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="product">
              <AccordionTrigger className="text-sm">المنتج</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link href="#features" className="hover:text-foreground">
                      المزايا
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="hover:text-foreground">
                      الأسعار
                    </Link>
                  </li>
                  <li>
                    <Link href="#docs" className="hover:text-foreground">
                      المستندات
                    </Link>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="company">
              <AccordionTrigger className="text-sm">الشركة</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link href="#about" className="hover:text-foreground">
                      من نحن
                    </Link>
                  </li>
                  <li>
                    <Link href="#careers" className="hover:text-foreground">
                      الوظائف
                    </Link>
                  </li>
                  <li>
                    <Link href="#contact" className="hover:text-foreground">
                      تواصل
                    </Link>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="legal">
              <AccordionTrigger className="text-sm">قانوني</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link href="#privacy" className="hover:text-foreground">
                      الخصوصية
                    </Link>
                  </li>
                  <li>
                    <Link href="#terms" className="hover:text-foreground">
                      الشروط
                    </Link>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid gap-6 sm:grid-cols-2 md:grid-cols-4 mt-2 text-sm">
          <div className="space-y-2">
            <div className="font-semibold">{brandTitle}</div>
            <p className="text-muted-foreground max-w-sm">{description}</p>
            {(social.facebook ||
              social.twitter ||
              social.instagram ||
              social.linkedin ||
              social.youtube) && (
              <div className="flex gap-3 pt-2">
                {social.facebook && (
                  <Link
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Facebook
                  </Link>
                )}
                {social.twitter && (
                  <Link
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Twitter
                  </Link>
                )}
                {social.instagram && (
                  <Link
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Instagram
                  </Link>
                )}
                {social.linkedin && (
                  <Link
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    LinkedIn
                  </Link>
                )}
                {social.youtube && (
                  <Link
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    YouTube
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="font-medium">المنتج</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <Link href="#features" className="hover:text-foreground">
                  المزايا
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground">
                  الأسعار
                </Link>
              </li>
              <li>
                <Link href="#docs" className="hover:text-foreground">
                  المستندات
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-medium">الشركة</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <Link href="#about" className="hover:text-foreground">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="#careers" className="hover:text-foreground">
                  الوظائف
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-foreground">
                  تواصل
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-medium">قانوني</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <Link href="#privacy" className="hover:text-foreground">
                  الخصوصية
                </Link>
              </li>
              <li>
                <Link href="#terms" className="hover:text-foreground">
                  الشروط
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 pt-2 text-xs text-muted-foreground flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-center sm:text-left">
          © {new Date().getFullYear()} {brandTitle}. جميع الحقوق محفوظة.
        </span>
        <div className="flex items-center justify-center sm:justify-end gap-3">
          <span className="text-center sm:text-right">
            {footerText ? footerText : "مصنوع بواسطة Next.js + Tailwind"}
          </span>
        </div>
      </div>
    </footer>
  );
}
