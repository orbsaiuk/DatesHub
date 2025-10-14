import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { getDefaultLogoUrl } from "@/lib/utils/defaultLogo";

// Optimized image component with SEO-friendly alt text generation
export default function ImageOptimized({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  loading,
  sizes,
  sanityImage = null,
  tenantName = "",
  context = "",
  ...props
}) {
  // Generate optimized alt text if not provided
  const optimizedAlt = alt || generateAltText(sanityImage, tenantName, context);

  // Determine loading strategy - priority overrides loading prop
  const loadingStrategy = priority ? undefined : loading || "lazy";

  // Handle Sanity images
  if (sanityImage?.asset) {
    const imageUrl = urlFor(sanityImage)
      .width(width || 800)
      .height(height || 600)
      .format("webp")
      .quality(75)
      .url();

    return (
      <Image
        src={imageUrl}
        alt={optimizedAlt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        loading={loadingStrategy}
        sizes={sizes}
        placeholder={sanityImage.asset?.metadata?.lqip ? "blur" : undefined}
        blurDataURL={sanityImage.asset?.metadata?.lqip || undefined}
        {...props}
      />
    );
  }

  // Handle regular images
  return (
    <Image
      src={src}
      alt={optimizedAlt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      loading={loadingStrategy}
      sizes={sizes}
      {...props}
    />
  );
}

// Generate SEO-friendly alt text
function generateAltText(sanityImage, tenantName = "", context = "") {
  if (sanityImage?.alt) return sanityImage.alt;

  const parts = [];

  if (tenantName) {
    parts.push(tenantName);
  }

  if (context) {
    parts.push(context);
  } else if (sanityImage?.asset?.originalFilename) {
    // Extract meaningful info from filename
    const filename = sanityImage.asset.originalFilename
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[-_]/g, " ") // Replace dashes/underscores with spaces
      .toLowerCase();
    parts.push(filename);
  }

  if (tenantName && context !== "logo") {
    parts.push("على دليل أعمال DatesHub");
  }

  return parts.join(" - ") || "صورة عمل";
}

// Company logo component with optimized metadata
export function CompanyLogo({
  tenant,
  size = "md",
  className = "",
  priority = false,
}) {
  const sizeMap = {
    sm: { width: 32, height: 32, className: "w-8 h-8" },
    md: { width: 60, height: 60, className: "w-15 h-15" },
    lg: { width: 120, height: 120, className: "w-30 h-30" },
    xl: { width: 200, height: 200, className: "w-50 h-50" },
  };

  const { width, height, className: sizeClass } = sizeMap[size] || sizeMap.md;

  // Handle Sanity images
  if (tenant?.logo?.asset) {
    return (
      <ImageOptimized
        sanityImage={tenant.logo}
        alt={`شعار شركة ${tenant.name}`}
        width={width}
        height={height}
        className={`${sizeClass} object-cover ${className}`}
        tenantName={tenant.name}
        context="logo"
        priority={priority}
      />
    );
  }

  // Handle direct URL logos
  const logoUrl = typeof tenant?.logo === "string" ? tenant.logo : null;
  if (logoUrl) {
    return (
      <ImageOptimized
        src={logoUrl}
        alt={`شعار شركة ${tenant.name}`}
        width={width}
        height={height}
        className={`${sizeClass} object-cover ${className}`}
        tenantName={tenant.name}
        context="logo"
        priority={priority}
      />
    );
  }

  // Use default logo when no logo is provided
  const defaultLogoUrl = getDefaultLogoUrl(tenant?.name);
  return (
    <ImageOptimized
      src={defaultLogoUrl}
      alt={`شعار شركة ${tenant?.name || "الشركة"}`}
      width={width}
      height={height}
      className={`${sizeClass} object-cover ${className}`}
      tenantName={tenant?.name}
      context="logo"
      priority={priority}
    />
  );
}
