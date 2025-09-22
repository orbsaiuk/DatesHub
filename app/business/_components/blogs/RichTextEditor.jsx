"use client";

import { useEffect, useRef, useState } from "react";
import { htmlToPlainText } from "@/lib/contentUtils";
import "quill/dist/quill.snow.css";
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your blog post content here...",
}) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let quillInstance;
    let mounted = true;

    async function init() {
      const Quill = (await import("quill")).default;

      // Toolbar options similar to the previous ReactQuill config
      const modules = {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link", "image"],
          [{ align: [] }],
          ["clean"],
        ],
      };

      if (!mounted || !containerRef.current) return;

      quillInstance = new Quill(containerRef.current, {
        theme: "snow",
        placeholder,
        modules,
      });

      quillRef.current = quillInstance;

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
      // Quill cleans up itself when the node is removed
    };
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (!isReady || !quillRef.current) return;
    const quill = quillRef.current;
    const current = quill.root.innerHTML;
    const valueHtml = typeof value === 'string' ? value : value?.html || '';
    if (valueHtml !== current) {
      const sel = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(valueHtml || "");
      if (sel) quill.setSelection(sel.index, sel.length);
    }
  }, [value, isReady]);

  return (
    <div className="quill-wrapper">
      <div ref={containerRef} />
    </div>
  );
}
