import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const address = searchParams.get("address");
    const city = searchParams.get("city");
    const region = searchParams.get("region");
    const zipCode = searchParams.get("zipCode");
    const country = searchParams.get("country");

    let query = q;
    if (!query) {
      const parts = [address, city, region, zipCode, country]
        .filter(Boolean)
        .map((s) => String(s).trim())
        .filter((s) => s.length > 0);
      query = parts.join(", ");
    }

    if (!query || query.trim().length === 0) {
      return new NextResponse("Missing query", { status: 400 });
    }

    const contact = process.env.GEOCODE_CONTACT_EMAIL || "support@example.com";

    const parse = (row) => {
      if (!row) return null;
      const lat = row.lat ?? row.latitude;
      const lng = row.lon ?? row.lng ?? row.longitude;
      if (!lat || !lng) return null;
      const latNum = Number(lat);
      const lngNum = Number(lng);
      if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;
      return { lat: latNum, lng: lngNum };
    };

    // Primary: Nominatim search
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query
      )}&limit=1&accept-language=en&email=${encodeURIComponent(contact)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": `dateshub-company-form/1.0 (${contact})` },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(t);
      if (res.ok) {
        const data = await res.json();
        const first = Array.isArray(data) ? data[0] : null;
        const mapped = parse(first);
        if (mapped) return NextResponse.json(mapped);
      }
    } catch {}

    // Fallback: geocode.maps.co
    try {
      const url2 = `https://geocode.maps.co/search?q=${encodeURIComponent(
        query
      )}&accept-language=en&limit=1`;
      const res2 = await fetch(url2, { cache: "no-store" });
      if (res2.ok) {
        const data2 = await res2.json();
        const first2 = Array.isArray(data2) ? data2[0] : null;
        const mapped2 = parse(first2);
        if (mapped2) return NextResponse.json(mapped2);
      }
    } catch {}

    return NextResponse.json(null);
  } catch (e) {
    return NextResponse.json(null);
  }
}
