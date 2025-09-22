"use client";

import { useEffect, useMemo, useState } from "react";
import MapView from "@/app/(public)/companies/_components/MapView";

function buildQueryFromLocation(loc) {
  if (!loc || typeof loc !== "object") return "";
  const parts = [loc.address, loc.city, loc.region, loc.zipCode, loc.country]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter((s) => s.length > 0);
  return parts.join(", ");
}

export default function CompanyMap({ company, className = "" }) {
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(false);

  const needsGeocode = useMemo(() => {
    return (Array.isArray(company?.locations) ? company.locations : []).map(
      (l) => {
        const hasGeo =
          l?.geo &&
          typeof l.geo.lat === "number" &&
          typeof l.geo.lng === "number";
        return { loc: l, hasGeo, query: buildQueryFromLocation(l) };
      }
    );
  }, [company]);

  useEffect(() => {
    let cancelled = false;
    let timer;
    async function run() {
      setLoading(true);
      const out = [];
      for (const { loc, hasGeo, query } of needsGeocode) {
        if (hasGeo) {
          out.push({
            id: `${company.id}-${loc.geo.lat},${loc.geo.lng}`,
            name: company.name,
            lat: loc.geo.lat,
            lng: loc.geo.lng,
          });
          continue;
        }
        if (!query) continue;
        try {
          const params = new URLSearchParams({ q: query });
          const res = await fetch(`/api/geocode/forward?${params.toString()}`, {
            cache: "no-store",
          });
          if (!res.ok) continue;
          const data = await res.json();
          if (
            data &&
            typeof data.lat === "number" &&
            typeof data.lng === "number"
          ) {
            out.push({
              id: `${company.id}-${data.lat},${data.lng}`,
              name: company.name,
              lat: data.lat,
              lng: data.lng,
            });
          }
        } catch (_) {}
      }
      if (!cancelled) setResolved(out);
      if (!cancelled) {
        // Keep the loading state visible briefly to avoid flicker
        timer = setTimeout(() => {
          if (!cancelled) setLoading(false);
        }, 300);
      }
    }
    run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [needsGeocode, company?.id, company?.name]);

  const markers = useMemo(() => {
    const fromGeo = (Array.isArray(company?.locations) ? company.locations : [])
      .filter((l) => l?.geo?.lat && l?.geo?.lng)
      .map((l, idx) => ({
        id: `${company.id}-g${idx}`,
        name: company.name,
        lat: l.geo.lat,
        lng: l.geo.lng,
      }));
    return [...fromGeo, ...resolved];
  }, [company, resolved]);

  return <MapView className={className} markers={markers} loading={loading} />;
}
