"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SocialLinksForm({ form, updateField, errors = {} }) {
  const links = Array.isArray(form?.socialLinks) ? form.socialLinks : [];

  const setLinks = useCallback(
    (next) => {
      updateField("socialLinks", next);
    },
    [updateField]
  );

  const handleChange = (index, value) => {
    const next = [...links];
    next[index] = value;
    setLinks(next);
  };

  const handleAdd = () => {
    setLinks([...(links || []), ""]);
  };

  const handleRemove = (index) => {
    const next = links.filter((_, i) => i !== index);
    setLinks(next);
  };

  const handleClear = () => {
    setLinks([]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        أضف روابط إلى موقعك الإلكتروني أو ملفاتك الشخصية على وسائل التواصل
        الاجتماعي.
      </p>
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="https://your-site-or-social.com"
                value={link || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                aria-invalid={!!errors?.socialLinks?.[index]}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleRemove(index)}
                className="cursor-pointer"
              >
                إزالة
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleAdd}
          className="cursor-pointer"
        >
          {links.length === 0 ? "أضف رابط" : " إضافة رابط اخر"}
        </Button>
        {links.length > 1 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleClear}
            className="cursor-pointer"
          >
            مسح الكل
          </Button>
        )}
      </div>
    </div>
  );
}
