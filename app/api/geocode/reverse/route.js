import { NextResponse } from "next/server";

export async function GET(req) {
  const empty = { address: "", city: "", region: "", country: "", zipCode: "" };
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (!lat || !lng)
      return new NextResponse("Missing lat/lng", { status: 400 });

    const contact = process.env.GEOCODE_CONTACT_EMAIL || "support@example.com";

    const buildAddress = (data) => {
      const a = data?.address || {};
      const name = data?.namedetails?.name || data?.name || "";
      const building = a.building || a.public_building || "";
      const road =
        a.road ||
        a.pedestrian ||
        a.footway ||
        a.path ||
        a.cycleway ||
        a.street ||
        "";
      const houseNumber = a.house_number || "";
      const local1 = a.neighbourhood || a.suburb || a.quarter || "";
      const local2 = a.estate || a.campus || a.housing_estate || a.farm || "";

      const line1 = [name || building].filter(Boolean).join("");
      const line2 = [houseNumber, road].filter(Boolean).join(" ").trim();
      const line3 = [local1, local2].filter(Boolean).join(", ").trim();

      const addressParts = [line1, line2, line3].filter(
        (s) => s && s.trim().length > 0
      );

      // Deduplicate repeating segments like "Arthington Lane, Arthington Lane"
      const seen = new Set();
      const deduped = [];
      for (const part of addressParts) {
        const norm = part.trim().replace(/\s+/g, " ").toLowerCase();
        if (!norm || seen.has(norm)) continue;
        seen.add(norm);
        deduped.push(part);
      }

      return deduped.join(", ");
    };

    const parse = (data) => {
      const a = data?.address || {};
      const city =
        a.city ||
        a.town ||
        a.village ||
        a.hamlet ||
        a.municipality ||
        a.locality ||
        a.city_district ||
        a.district ||
        "";
      const region =
        a.state || a.region || a.state_district || a.county || a.province || "";
      const country =
        a.country ||
        (a.country_code ? String(a.country_code).toUpperCase() : "");
      const zipCode = a.postcode || a.post_code || "";
      const address = buildAddress(data);
      return { address, city, region, country, zipCode };
    };

    const hasAnyField = (m) =>
      Boolean(m.address || m.city || m.region || m.country || m.zipCode);

    // Primary: Nominatim with timeout and contact info; try multiple zoom levels
    const nominatim = async (zoom) => {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lng)}&zoom=${zoom}&addressdetails=1&namedetails=1&accept-language=en&email=${encodeURIComponent(
        contact
      )}`;
      const res = await fetch(url, {
        headers: { "User-Agent": `dateshub-company-form/1.0 (${contact})` },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) return null;
      const data = await res.json();
      return parse(data);
    };

    for (const z of [18, 16, 14, 12, 10]) {
      try {
        const mapped = await nominatim(z);
        if (mapped && hasAnyField(mapped)) return NextResponse.json(mapped);
      } catch {}
    }

    // Fallback: geocode.maps.co
    try {
      const fallbackUrl = `https://geocode.maps.co/reverse?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lng)}&accept-language=en`;
      const res2 = await fetch(fallbackUrl, { cache: "no-store" });
      if (res2.ok) {
        const data2 = await res2.json();
        const mapped2 = parse(data2);
        if (hasAnyField(mapped2)) return NextResponse.json(mapped2);
      }
    } catch {}

    // Last resort: return empty mapping so UI can continue gracefully
    return NextResponse.json(empty);
  } catch (e) {
    return NextResponse.json(empty);
  }
}
