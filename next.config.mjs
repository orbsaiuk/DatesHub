/** @type {import('next').NextConfig} */
const allowedOrigins = (process.env.NEXT_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig = {
  // Optimize build output
  experimental: {
    optimizeCss: true,
  },

  // Compression and performance optimizations
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    // Optimize image formats
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
