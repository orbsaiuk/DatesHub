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
  multiple = false,
  maxFiles = 5,
}) {
  const inputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Generate preview URLs for File objects with caching
  const generatePreviewUrls = useMemo(() => {
    if (!image) return [];

    const cache = globalFileUrlCache;

    if (multiple && Array.isArray(image)) {
      return image
        .map((item) => {
          if (item instanceof File) {
            // Use cached URL if available, otherwise create new one
            if (!cache.has(item)) {
              cache.set(item, URL.createObjectURL(item));
            }
            return cache.get(item);
          }
          // Handle existing Sanity image references
          if (item?.asset?._ref) {
            try {
              return urlFor(item).width(120).height(120).fit("crop").url();
            } catch (error) {
              // Error generating Sanity preview URL
              return null;
            }
          }
          return null;
        })
        .filter(Boolean);
    } else {
      // Single image
      if (image instanceof File) {
        if (!cache.has(image)) {
          cache.set(image, URL.createObjectURL(image));
        }
        return [cache.get(image)];
      }
      if (image?.asset?._ref) {
        try {
          return [urlFor(image).width(120).height(120).fit("crop").url()];
        } catch (error) {
          // Error generating Sanity preview URL
          return [];
        }
      }
    }
    return [];
  }, [image, multiple]);

  // Update preview URLs when they change
  useEffect(() => {
    setPreviewUrls(generatePreviewUrls);
  }, [generatePreviewUrls]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Don't cleanup global cache on unmount since other components might be using it
      // Only cleanup when the entire page/app unmounts
    };
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file sizes
    const maxSize = maxSizeMB * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file types
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast.error("Please select valid image files (JPG, PNG, GIF, WebP, SVG)");
      return;
    }

    // Validate file count for multiple uploads
    if (multiple && image && Array.isArray(image)) {
      const totalFiles = image.length + files.length;
      if (totalFiles > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }
    }

    // Store files locally for preview
    if (multiple) {
      const currentImages = Array.isArray(image) ? image : [];
      onImageChange([...currentImages, ...files]);
    } else {
      onImageChange(files[0]);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove = null) => {
    const cache = globalFileUrlCache;

    if (multiple && Array.isArray(image)) {
      const imageToRemove = image[indexToRemove];
      if (imageToRemove instanceof File && cache.has(imageToRemove)) {
        URL.revokeObjectURL(cache.get(imageToRemove));
        cache.delete(imageToRemove);
      }
      const newImages = image.filter((_, index) => index !== indexToRemove);
      onImageChange(newImages);
    } else {
      if (image instanceof File && cache.has(image)) {
        URL.revokeObjectURL(cache.get(image));
        cache.delete(image);
      }
      onImageChange(null);
    }
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const renderPreview = (previewUrl, index = null) => {
    if (!previewUrl) return null;

    return (
      <div key={index || 0} className="relative group">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border">
          <Image
            src={previewUrl}
            alt={`Preview ${index !== null ? index + 1 : ""}`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeImage(index)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  const hasImages = multiple
    ? Array.isArray(image) && image.length > 0
    : Boolean(image);

  const canAddMore = multiple
    ? !Array.isArray(image) || image.length < maxFiles
    : !image;

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Area */}
      {hasImages && previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {multiple
            ? previewUrls.map((url, index) => renderPreview(url, index))
            : renderPreview(previewUrls[0])}
        </div>
      )}

      {/* Upload Button/Area */}
      {!hasImages && (
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 sm:p-5 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
          onClick={openFilePicker}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
              {hasImages ? (
                <Upload className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium">
                {hasImages ? "Add More" : placeholder}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                JPG, PNG, SVG up to {maxSizeMB}MB
                {multiple ? ` (max ${maxFiles})` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add More Button (alternative to drop area when at limit) */}
      {hasImages && canAddMore && (
        <Button
          type="button"
          variant="outline"
          onClick={openFilePicker}
          className="w-full px-4 py-2"
        >
          <Upload className="w-4 h-4 me-2" />
          إضافة المزيد من الصور
        </Button>
      )}
    </div>
  );
}
