import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { getAuthenticatedUser } from "@/lib/auth/authorization";

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
    const company = await writeClient.fetch(
      `*[_type == "company" && tenantId == $tenantId][0]{ _id, name, tenantId }`,
      { tenantId }
    );

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Return minimal company data for breadcrumbs
    return NextResponse.json({
      _id: company._id,
      name: company.name,
      tenantId: company.tenantId || tenantId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
