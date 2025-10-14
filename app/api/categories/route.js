import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { ALL_CATEGORIES_QUERY } from "@/sanity/queries/categories";

export async function GET() {
  try {
    const categories = await client.fetch(ALL_CATEGORIES_QUERY);
    return NextResponse.json(categories || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
