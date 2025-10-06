import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/serverClient";
import { hasTenanMembership } from "@/lib/auth/authorization";
import {
  COMPANY_BY_TENANT_QUERY,
  USER_COMPANY_MEMBERSHIPS_QUERY,
} from "@/sanity/queries/company";

function toPortableText(text) {
  if (!text) return undefined;
  return [
    {
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", text: String(text), marks: [] }],
    },
  ];
}

function toGeopoint(geo) {
  if (!geo) return undefined;
  const lat = Number(geo.lat);
  const lng = Number(geo.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return { _type: "geopoint", lat, lng };
}

function sanitizeLocations(locations) {
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
}

function pickAllowedFields(input) {
  // Only allow updating these fields for safety
  const allowed = {
    website: input.website,
    totalEmployees: input.totalEmployees,
    foundingYear: input.foundingYear,
    registrationNumber: input.registrationNumber,
    socialLinks: Array.isArray(input.socialLinks)
      ? input.socialLinks
      : undefined,
    contact: input.contact,
    companyType: input.companyType,
    categories: input.categories,
    extraServices: input.extraServices,
    locations: sanitizeLocations(input.locations),
    openingHours: input.openingHours,
    name: input.name,
    logo: input.logo,
    description:
      typeof input.description === "string"
        ? toPortableText(input.description)
        : input.description,
  };
  return Object.fromEntries(
    Object.entries(allowed).filter(([, v]) => typeof v !== "undefined")
  );
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { tenantId: bodyTenantId, data } = body || {};

    // Resolve user's company membership if tenantId not explicitly provided
    let tenantId = bodyTenantId;
    if (!tenantId) {
      const user = await writeClient.fetch(USER_COMPANY_MEMBERSHIPS_QUERY, {
        userId,
      });
      tenantId = user?.memberships?.[0]?.tenantId;
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: "No company membership found" },
        { status: 403 }
      );
    }

    // Verify user has access to this company
    const hasAccess = await hasTenanMembership(userId, "company", tenantId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this company" },
        { status: 403 }
      );
    }

    // Fetch company doc _id by tenantId
    const company = await writeClient.fetch(COMPANY_BY_TENANT_QUERY, {
      tenantType: "company",
      tenantId,
    });

    if (!company?._id) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updates = pickAllowedFields(data || {});
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    const result = await writeClient
      .patch(company._id)
      .set(updates)
      .commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("/api/company/update error", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}
