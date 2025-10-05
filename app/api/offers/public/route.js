import { NextResponse } from "next/server";

// DEPRECATED: This endpoint is deprecated in favor of promotional banners
// Use /api/promotional-banners/public for home page banners
// Use /api/offers/tenant for company-specific offers

export async function GET(req) {
  return NextResponse.json({ 
    offers: [],
    deprecated: true,
    message: "This endpoint is deprecated. Use /api/promotional-banners/public for home page content."
  });
}
