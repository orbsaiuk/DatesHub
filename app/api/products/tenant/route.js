import { NextResponse } from "next/server";
import { getProductsForTenant } from "@/services/sanity/products";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantType = searchParams.get("tenantType");
        const tenantId = searchParams.get("tenantId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "6");

        if (!tenantType || !tenantId) {
            return NextResponse.json(
                { error: "tenantType and tenantId are required" },
                { status: 400 }
            );
        }

        const result = await getProductsForTenant(tenantType, tenantId, page, limit);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}