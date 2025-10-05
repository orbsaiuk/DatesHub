import { NextResponse } from "next/server";
import { getActivePromotionalBanners } from "@/services/sanity/promotionalBanners";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetAudience = searchParams.get("audience") || "all";
    
    // Validate target audience (can be comma-separated)
    const validAudiences = ["all", "companies", "suppliers"];
    const audiences = targetAudience.split(',').map(a => a.trim());
    const invalidAudiences = audiences.filter(a => !validAudiences.includes(a));
    
    if (invalidAudiences.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid target audience(s): ${invalidAudiences.join(', ')}` },
        { status: 400 }
      );
    }

    const banners = await getActivePromotionalBanners(targetAudience);

    return NextResponse.json({
      success: true,
      banners,
      count: banners.length
    });
  } catch (error) {
    console.error("Error fetching promotional banners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promotional banners" },
      { status: 500 }
    );
  }
}