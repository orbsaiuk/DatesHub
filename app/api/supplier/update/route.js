import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";

export async function PATCH(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Helpers to coerce incoming payloads to Sanity types
    const toPortableText = (text) => {
      if (!text) return undefined;
      if (Array.isArray(text)) return text; // already PT
      return [
        {
          _type: "block",
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", text: String(text), marks: [] }],
        },
      ];
    };

    const toGeopoint = (geo) => {
      if (!geo) return undefined;
      const lat = Number(geo.lat);
      const lng = Number(geo.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
      return { _type: "geopoint", lat, lng };
    };

    const sanitizeLocations = (locations) => {
      if (!Array.isArray(locations)) return undefined;
      return locations
        .map((loc) => {
          if (!loc || typeof loc !== "object") return null;
          return {
            address: loc.address || "",
            city: loc.city || "",
            region: loc.region || "",
            country: loc.country || "",
            zipCode: loc.zipCode || "",
            geo: toGeopoint(loc.geo),
          };
        })
        .filter(Boolean);
    };

    const body = await request.json();
    const { tenantId, ...rawUpdate } = body || {};

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this supplier
    const userQuery = `*[_type == "user" && clerkId == $userId][0]{
      "memberships": memberships[tenantType == "supplier" && tenantId == $tenantId]
    }`;

    const user = await writeClient.fetch(userQuery, { userId, tenantId });

    if (!user?.memberships?.length) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Find the supplier document
    const supplierQuery = `*[_type == "supplier" && tenantId == $tenantId][0]`;
    const supplier = await writeClient.fetch(supplierQuery, { tenantId });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Build safe updates: allow only supplier fields and coerce types
    const allowed = {
      name: rawUpdate.name,
      website: rawUpdate.website,
      description: toPortableText(rawUpdate.description),
      logo: rawUpdate.logo,
      supplierType: rawUpdate.supplierType,
      categories: Array.isArray(rawUpdate.categories)
        ? rawUpdate.categories
        : undefined,
      extraServices: Array.isArray(rawUpdate.extraServices)
        ? rawUpdate.extraServices
        : undefined,
      openingHours: Array.isArray(rawUpdate.openingHours)
        ? rawUpdate.openingHours
        : undefined,
      contact: rawUpdate.contact,
      locations: sanitizeLocations(rawUpdate.locations),

    };
    const updates = Object.fromEntries(
      Object.entries(allowed).filter(([, v]) => typeof v !== "undefined")
    );

    // Update the supplier document
    const updatedSupplier = await writeClient
      .patch(supplier._id)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({
      success: true,
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
