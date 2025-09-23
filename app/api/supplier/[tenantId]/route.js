import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { getAuthenticatedUser } from "@/lib/auth/authorization";

export async function GET(_request, { params }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tenantId } = params || {};
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }

    const id = decodeURIComponent(tenantId);
    const supplier = await writeClient.fetch(
      `*[_type == "supplier" && (tenantId == $id || slug.current == $id)][0]{ _id, name, tenantId }`,
      { id }
    );

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: supplier._id,
      name: supplier.name,
      tenantId: supplier.tenantId || id,
    });
  } catch (error) {
    console.error("Error fetching supplier data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
