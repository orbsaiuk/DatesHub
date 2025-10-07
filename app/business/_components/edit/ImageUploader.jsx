"use client";
import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { urlFor } from "@/sanity/lib/image";

// Global cache for file URLs that persists across component re-renders
const globalFileUrlCache = new Map();

// Cleanup function for when the page is hidden (bfcache-friendly)
if (typeof window !== "undefined") {
  window.addEventListener(
    "pagehide",
    () => {
      globalFileUrlCache.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      globalFileUrlCache.clear();
    },
    { capture: true }
  );
}

export default function ImageUploader({
  image,
  onImageChange,
  maxSizeMB = 5,
  className = "",
  placeholder = "Add image",
}) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileKey, setFileKey] = useState(0); // Add key to force re-render when file changes

  // Generate preview URL for single image
  const generatePreviewUrl = useMemo(() => {
    if (!image) return null;

    const cache = globalFileUrlCache;

    // Handle File object (new upload)
    if (image instanceof File) {
      if (!cache.has(image)) {
        cache.set(image, URL.createObjectURL(image));
      }
      return cache.get(image);
    }

    // Handle Sanity image with _ref (use urlFor helper)
    if (image?.asset?._ref) {
      try {
        return urlFor(image).width(120).height(120).fit("crop").url();
      } catch (error) {
        console.error("Error generating Sanity preview URL:", error);
        return null;
      }
    }

    // Handle Sanity image with direct URL
    if (image?.asset?.url) {
      return image.asset.url;
    }

    // Handle plain string URL
    if (typeof image === "string" && image.startsWith("http")) {
      return image;
    }

    return null;
  }, [image]);

  // Update preview URL when it changes
  useEffect(() => {
    // Only update the preview URL from the image prop if we don't already have a local preview URL
    // This prevents the server image from replacing our local preview after form submission
    if (!previewUrl || !previewUrl.startsWith("blob:")) {
      setPreviewUrl(generatePreviewUrl);
    }
  }, [generatePreviewUrl, previewUrl]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Don't cleanup global cache on unmount since other components might be using it
      // Only cleanup when the entire page/app unmounts
    };
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`حجم الملف يجب أن يكون أقل من ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("يرجى اختيار صورة صالحة (JPG, PNG, GIF, WebP, SVG)");
      return;
    }

    // Clear previous preview if exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create new preview URL
    const newPreviewUrl = URL.createObjectURL(file);
    globalFileUrlCache.set(file, newPreviewUrl);
    setPreviewUrl(newPreviewUrl);
    setFileKey((prevKey) => prevKey + 1); // Increment key to force re-render

    // Update image
    onImageChange(file);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = () => {
    const cache = globalFileUrlCache;

    // Clean up any blob URLs
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (image instanceof File && cache.has(image)) {
      URL.revokeObjectURL(cache.get(image));
      cache.delete(image);
    }

    // Reset state
    setPreviewUrl(null);
    setFileKey((prevKey) => prevKey + 1); // Force re-render
    onImageChange(null);
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const hasImage = Boolean(image);

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Area */}
      {hasImage && previewUrl && (
        <div className="relative group inline-block">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border">
            <Image
              key={fileKey} // Add key to force re-render when file changes
              src={previewUrl}
              alt="Preview"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized={
                previewUrl.startsWith("blob:") ||
                previewUrl.includes("cdn.sanity.io")
              }
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={removeImage}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Upload Button/Area */}
      {!hasImage && (
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 sm:p-5 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
          onClick={openFilePicker}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium">{placeholder}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                JPG, PNG, SVG up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Change Image Button */}
      {hasImage && (
        <Button
          type="button"
          variant="outline"
          onClick={openFilePicker}
          className="w-full px-4 py-2"
        >
          <Upload className="w-4 h-4 me-2" />
          تغيير الصورة
        </Button>
      )}
    </div>
  );
}
