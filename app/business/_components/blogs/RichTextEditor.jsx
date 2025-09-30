"use client";

import { useEffect, useRef, useState } from "react";
import { htmlToPlainText } from "@/lib/contentUtils";
import "quill/dist/quill.snow.css";

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "اكتب محتوى مقالك هنا...",
}) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let quillInstance;
    let mounted = true;

    async function init() {
      const Quill = (await import("quill")).default;

      // Toolbar with Arabic-friendly options
      const modules = {
        toolbar: {
          container: "#custom-toolbar",
        },
      };

      if (!mounted || !containerRef.current) return;

      quillInstance = new Quill(containerRef.current, {
        theme: "snow",
        placeholder,
        modules,
      });

      quillRef.current = quillInstance;

      // Force RTL + right alignment for Arabic by default
      quillInstance.root.setAttribute("dir", "rtl");
      quillInstance.root.style.textAlign = "right";

      // Set initial value as HTML
      if (value) {
        quillInstance.clipboard.dangerouslyPasteHTML(value);
      }

      quillInstance.on("text-change", () => {
        const html = quillInstance.root.innerHTML;
        const plainText = htmlToPlainText(html);
        onChange && onChange({ html, plainText });
      });

      setIsReady(true);
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (!isReady || !quillRef.current) return;
    const quill = quillRef.current;
    const current = quill.root.innerHTML;
    const valueHtml = typeof value === "string" ? value : value?.html || "";
    if (valueHtml !== current) {
      const sel = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(valueHtml || "");
      if (sel) quill.setSelection(sel.index, sel.length);
    }
  }, [value, isReady]);

  return (
    <div className="quill-wrapper">
      <div id="custom-toolbar" className="quill-toolbar-rtl">
        <select className="ql-header">
          <option value="1">عنوان 1</option>
          <option value="2">عنوان 2</option>
          <option value="3">عنوان 3</option>
          <option value="">النص العادي</option>
        </select>

        <button className="ql-bold" title="عريض"></button>
        <button className="ql-italic" title="مائل"></button>
        <button className="ql-underline" title="تحته خط"></button>
        <button className="ql-strike" title="يتوسطه خط"></button>

        <button
          className="ql-list"
          value="ordered"
          title="قائمة مرقمة"
        ></button>
        <button className="ql-list" value="bullet" title="قائمة نقطية"></button>

        <button className="ql-link" title="إدراج رابط"></button>

        <select className="ql-align" title="محاذاة">
          <option value=""></option>
          <option value="right"></option>
          <option value="center"></option>
        </select>

        <button className="ql-clean" title="إزالة التنسيق"></button>
      </div>

      <div ref={containerRef} />
    </div>
  );
}
