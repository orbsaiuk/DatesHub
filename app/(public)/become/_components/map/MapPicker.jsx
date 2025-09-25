"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ value, onChange }) {
  const [pos, setPos] = useState(
    value && typeof value.lat === "number" && typeof value.lng === "number"
      ? { lat: value.lat, lng: value.lng }
      : null
  );

  useEffect(() => {
    if (
      value &&
      typeof value.lat === "number" &&
      typeof value.lng === "number"
    ) {
      setPos({ lat: value.lat, lng: value.lng });
    }
  }, [value]);

  const pinIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <svg width="28" height="36" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.925 0 1 4.925 1 11c0 7.25 9.172 19.22 10.01 20.3a1.25 1.25 0 0 0 1.98 0C13.828 30.22 23 18.25 23 11 23 4.925 18.075 0 12 0zm0 16a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="#ef4444" stroke="white" stroke-width="2"/>
          </svg>
        `,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      }),
    []
  );

  function handleSelect(lat, lng) {
    setPos({ lat, lng });
    onChange?.(lat, lng);
  }

  // Default to Middle East when not selected
  const defaultCenter = [25.5, 40.0]; // Kuwait/Persian Gulf region
  const initialCenter = pos ? [pos.lat, pos.lng] : defaultCenter;
  const initialZoom = pos ? 12 : 4; // Lower zoom to show entire Middle East region

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full !z-0"
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickHandler onSelect={handleSelect} />
        {pos ? <Marker position={[pos.lat, pos.lng]} icon={pinIcon} /> : null}
      </MapContainer>
    </div>
  );
}
