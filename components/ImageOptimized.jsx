import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

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
  companyName = "",
  context = "",
  ...props
}) {
  // Generate optimized alt text if not provided
  const optimizedAlt =
    alt || generateAltText(sanityImage, companyName, context);

  // Determine loading strategy - priority overrides loading prop
  const loadingStrategy = priority ? undefined : loading || "lazy";

  // Handle Sanity images
  if (sanityImage?.asset) {
    const imageUrl = urlFor(sanityImage)
      .width(width || 800)
      .height(height || 600)
      .format("webp")
      .quality(85)
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
function generateAltText(sanityImage, companyName = "", context = "") {
  if (sanityImage?.alt) return sanityImage.alt;

  const parts = [];

  if (companyName) {
    parts.push(companyName);
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

  if (companyName && context !== "logo") {
    parts.push("على دليل أعمال OrbsAI");
  }

  return parts.join(" - ") || "صورة عمل";
}

// Company logo component with optimized metadata
export function CompanyLogo({
  company,
  size = "md",
  className = "",
  priority = false,
}) {
  if (!company?.logo) return null;

  const sizeMap = {
    sm: { width: 32, height: 32, className: "w-8 h-8" },
    md: { width: 60, height: 60, className: "w-15 h-15" },
    lg: { width: 120, height: 120, className: "w-30 h-30" },
    xl: { width: 200, height: 200, className: "w-50 h-50" },
  };

  const { width, height, className: sizeClass } = sizeMap[size] || sizeMap.md;

  // Handle both Sanity images and direct URLs
  if (company.logo?.asset) {
    return (
      <ImageOptimized
        sanityImage={company.logo}
        alt={`شعار شركة ${company.name}`}
        width={width}
        height={height}
        className={`${sizeClass} object-cover ${className}`}
        companyName={company.name}
        context="logo"
        priority={priority}
      />
    );
  }

  // Handle direct URL logos
  const logoUrl = typeof company.logo === "string" ? company.logo : null;
  if (logoUrl) {
    return (
      <ImageOptimized
        src={logoUrl}
        alt={`شعار شركة ${company.name}`}
        width={width}
        height={height}
        className={`${sizeClass} object-cover ${className}`}
        companyName={company.name}
        context="logo"
        priority={priority}
      />
    );
  }

  // Fallback placeholder
  return (
    <div
      className={`${sizeClass} bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ${className}`}
    >
      <div className="w-1/2 h-1/2 rounded bg-primary/20" />
    </div>
  );
}
