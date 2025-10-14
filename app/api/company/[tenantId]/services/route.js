import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";

export async function GET(request, { params }) {
  try {
    const { tenantId } = await params;

    if (!tenantId) {
      return NextResponse.json(
        { error: "Company tenant ID is required" },
        { status: 400 }
      );
    }

    // Fetch company with its categories and extra services
    const company = await writeClient.fetch(
      `*[_type == "company" && tenantId == $tenantId][0]{
        categories[]->{
          _id,
          title,
          slug,
          description
        },
        extraServices
      }`,
      { tenantId }
    );

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      categories: company.categories || [],
      extraServices: company.extraServices || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company services" },
      { status: 500 }
    );
  }
}
