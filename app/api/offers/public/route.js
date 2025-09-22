import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { PUBLIC_COMPANY_OFFERS_QUERY, COMPANY_SUPPLIER_OFFERS_QUERY } from "@/sanity/queries/offer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "company" or "supplier"

    let offers;
    if (type === "supplier") {
      offers = await writeClient.fetch(COMPANY_SUPPLIER_OFFERS_QUERY);
    } else {
      // Default to company offers for public landing page
      offers = await writeClient.fetch(PUBLIC_COMPANY_OFFERS_QUERY);
    }

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
