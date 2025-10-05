import { NextResponse } from "next/server";
import { getOffersForTenant } from "@/services/sanity/offers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantType = searchParams.get("tenantType");
    const tenantId = searchParams.get("tenantId");
    const publicView = searchParams.get("publicView") === "true";

    if (!tenantType || !tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantType and tenantId are required" },
        { status: 400 }
      );
    }

    if (!["company", "supplier"].includes(tenantType)) {
      return NextResponse.json(
        { success: false, error: "tenantType must be 'company' or 'supplier'" },
        { status: 400 }
      );
    }

    const result = await getOffersForTenant(tenantType, tenantId);

    // For public/directory display, show only active offers
    if (publicView && result.items) {
      result.items = result.items.filter((offer) => offer.status === "active");
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching tenant offers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
