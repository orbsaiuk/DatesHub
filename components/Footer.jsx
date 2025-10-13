"use client";

import ImageOptimized from "./ImageOptimized";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-black mt-auto">
      <div className="container mx-auto text-xs text-white flex gap-1 items-center justify-center">
        <span>جميع الحقوق محفوظة</span>
        <span>© {new Date().getFullYear()}</span>
        <ImageOptimized
          src="/logo.png"
          alt="logo"
          width={50}
          height={50}
          context="logo"
          className="invert"
        />
      </div>
    </footer>
  );
}
