import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }

    // Use a minimal query to get just the company name
    const supplier = await writeClient.fetch(
      `*[_type == "supplier" && tenantId == $tenantId][0]{ _id, name, tenantId }`,
      { tenantId }
    );

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Return minimal company data for breadcrumbs
    return NextResponse.json({
      _id: supplier._id,
      name: supplier.name,
      tenantId: supplier.tenantId || tenantId,
    });
  } catch (error) {
    console.error("Error fetching supplier data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
