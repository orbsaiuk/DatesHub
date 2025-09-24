import { NextResponse } from "next/server";
import { getAllPlans } from "@/services/sanity/subscriptions";

export async function GET(request) {
  try {
    const plans = await getAllPlans();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
