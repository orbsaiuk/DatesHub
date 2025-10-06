"use client";

import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Spinner from "@/components/ui/spinner";

function FitToMarkers({ markers }) {
    const map = useMap();
    useEffect(() => {
        if (!map || !markers?.length) return;
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
        if (bounds.isValid()) {
            map.fitBounds(bounds.pad(0.2), { animate: false });
        }
    }, [map, markers]);
    return null;
}

export default function ClientOnlyMap({
    markers = [],
    className = "",
    center,
    zoom = 5,
    loading = false,
}) {
    const hasCenter = Boolean(
        center && typeof center.lat === "number" && typeof center.lng === "number"
    );
    const first = useMemo(
        () =>
            markers.find(
                (m) => typeof m.lat === "number" && typeof m.lng === "number"
            ),
        [markers]
    );
    const initialCenter = hasCenter
        ? [center.lat, center.lng]
        : first
            ? [first.lat, first.lng]
            : [20, 0];

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
                popupAnchor: [0, -32],
            }),
        []
    );

    if (loading && markers.length === 0) {
        return (
            <div className={className} style={{ height: "100%", width: "100%" }}>
                <div className="p-6 h-full w-full flex items-center justify-center">
                    <div className="w-full max-w-md relative">
                        <Skeleton className="h-60 w-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Spinner />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={className} style={{ height: "100%", width: "100%" }}>
            <MapContainer
                center={initialCenter}
                zoom={zoom}
                scrollWheelZoom
                className="z-10"
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {!hasCenter && markers.length > 0 ? (
                    <FitToMarkers markers={markers} />
                ) : null}
                {markers.map((m) => (
                    <Marker
                        key={m.id || `${m.lat},${m.lng}`}
                        position={[m.lat, m.lng]}
                        icon={pinIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: 160 }}>
                                {m.name ? (
                                    <div style={{ marginBottom: 6 }}>{m.name}</div>
                                ) : null}
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#2563eb" }}
                                >
                                    Open in Google Maps
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}