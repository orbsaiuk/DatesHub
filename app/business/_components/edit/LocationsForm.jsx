"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, MapPin } from "lucide-react";
import MethodSelector from "../../../(public)/become/_components/location/MethodSelector";
import MapSection from "../../../(public)/become/_components/location/MapSection";
import CollapsedRow from "../../../(public)/become/_components/location/CollapsedRow";

export default function LocationsForm({ form, updateField, locationErrors }) {
  const [modes, setModes] = useState({}); // { [index]: 'map' | 'manual' }
  const [locatingIndex, setLocatingIndex] = useState(null);
  const [reverseLoadingIndex, setReverseLoadingIndex] = useState(null);
  const [forwardLoadingIndex, setForwardLoadingIndex] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    const map = {};
    (form.locations || []).forEach((_, i) => {
      map[i] = true;
    });
    return map;
  }); // { [index]: boolean }

  const addLocation = () => {
    const newLocation = {
      address: "",
      city: "",
      region: "",
      country: "",
      zipCode: "",
      geo: undefined,
      __new: true,
    };
    const next = [...(form.locations || []), newLocation];
    updateField("locations", next);
    // mark new index collapsed by default
    const newIndex = next.length - 1;
    setCollapsed((m) => ({ ...m, [newIndex]: false }));
    setModes((m) => ({ ...m, [newIndex]: "manual" }));
  };

  const removeLocation = (index) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Remove this location? This action cannot be undone."
      );
      if (!confirmed) return;
    }

    const prevLocations = form.locations || [];
    const newLocations = prevLocations.filter((_, i) => i !== index);
    updateField("locations", newLocations);

    // rebuild collapsed mapping (all collapsed by default)
    const nextCollapsed = {};
    newLocations.forEach((_, i) => {
      nextCollapsed[i] = true;
    });
    setCollapsed(nextCollapsed);

    // rebuild modes while preserving state order after index removal
    setModes((m) => {
      const next = {};
      prevLocations.forEach((_, i) => {
        if (i === index) return;
        const from = i;
        const to = i > index ? i - 1 : i;
        if (typeof m[from] !== "undefined") next[to] = m[from];
      });
      return next;
    });

    // clear any loading indicators tied to previous index
    setLocatingIndex((v) => (v === index ? null : v));
    setReverseLoadingIndex((v) => (v === index ? null : v));
    setForwardLoadingIndex((v) => (v === index ? null : v));
  };

  const updateLocation = (index, field, value) => {
    const newLocations = [...(form.locations || [])];
    newLocations[index] = { ...newLocations[index], [field]: value };
    updateField("locations", newLocations);
  };

  const updateLocationMany = (index, partial) => {
    const newLocations = [...(form.locations || [])];
    newLocations[index] = { ...newLocations[index], ...partial };
    updateField("locations", newLocations);
  };

  const setCollapsedAt = (index, value) => {
    setCollapsed((m) => ({ ...m, [index]: value }));
  };

  const getSummary = (loc) => {
    if (!loc) return "Untitled location";
    const parts = [loc.address, loc.city, loc.region, loc.country]
      .map((s) => (s || "").trim())
      .filter(Boolean);
    const summary = parts.join(", ");
    return summary || "Untitled location";
  };

  const getErrorFor = (index, field) => {
    const loc = (form.locations || [])[index] || {};
    const fromParent = Array.isArray(locationErrors)
      ? locationErrors[index] || null
      : null;
    // For new locations, require all fields
    if (loc.__new) {
      const v = (loc[field] || "").toString().trim();
      return v
        ? null
        : `${field === "zipCode" ? "Zip code" : field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (!fromParent) return null;
    return fromParent[field] || null;
  };

  const updateGeo = (index, lat, lng) => {
    const newLocations = [...(form.locations || [])];
    const curr = { ...(newLocations[index] || {}) };
    curr.geo = lat != null && lng != null ? { lat, lng } : undefined;
    newLocations[index] = curr;
    updateField("locations", newLocations);
  };

  const fetchAndFillAddress = async (index, lat, lng) => {
    setReverseLoadingIndex(index);
    const loadingId = toast.loading("Resolving address from pin...");
    try {
      const qs = `lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
      const res = await fetch(`/api/geocode/reverse?${qs}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        toast.error("Failed to resolve address for this pin.");
        return;
      }
      const data = await res.json();
      if (data) {
        updateLocationMany(index, {
          address: data.address || "",
          city: data.city || "",
          region: data.region || "",
          country: data.country || "",
          zipCode: data.zipCode || "",
        });
        toast.success("Address filled from pin");
      } else {
        toast.message("No address found for this pin.");
      }
    } catch (e) {
      toast.error("Could not fetch address for this pin.");
    } finally {
      setReverseLoadingIndex(null);
      toast.dismiss(loadingId);
    }
  };

  const onMapPinChange = (index, lat, lng) => {
    updateGeo(index, lat, lng);
    if (
      typeof lat === "number" &&
      Number.isFinite(lat) &&
      typeof lng === "number" &&
      Number.isFinite(lng)
    ) {
      fetchAndFillAddress(index, lat, lng);
    }
  };

  const onModeChange = (index, nextMode) => {
    setModes((m) => ({ ...m, [index]: nextMode }));
    if (nextMode === "map") {
      const loc = (form.locations || [])[index] || {};
      const hasGeo =
        loc.geo &&
        Number.isFinite(Number(loc.geo.lat)) &&
        Number.isFinite(Number(loc.geo.lng));
      if (!hasGeo) {
        const hasAny = [
          loc.address,
          loc.city,
          loc.region,
          loc.zipCode,
          loc.country,
        ]
          .map((v) => (v || "").trim())
          .some(Boolean);
        if (hasAny) {
          // Try to place pin from address automatically
          forwardGeocode(index);
        } else {
          toast.message("Click on the map to drop a pin, or enter an address.");
        }
      }
    }
  };

  const onLocateMe = async (index) => {
    if (!navigator?.geolocation) return;
    const loadingId = toast.loading("Getting your location...");
    setLocatingIndex(index);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        })
      );
      const { latitude, longitude } = pos.coords;
      updateGeo(index, latitude, longitude);
      setModes((m) => ({ ...m, [index]: "map" }));
      setReverseLoadingIndex(index);
      const qs = `lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(
        longitude
      )}`;
      const res = await fetch(`/api/geocode/reverse?${qs}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          updateLocationMany(index, {
            address: data.address || "",
            city: data.city || "",
            region: data.region || "",
            country: data.country || "",
            zipCode: data.zipCode || "",
          });
          toast.success("Pinned your current location and filled address");
        } else {
          toast.message("Could not determine address from your location.");
        }
      } else {
        toast.error(
          "Reverse geocoding failed. Try manual entry or drop a pin."
        );
      }
    } catch (e) {
      toast.error("Unable to access your location.");
    } finally {
      setLocatingIndex(null);
      setReverseLoadingIndex(null);
      toast.dismiss(loadingId);
    }
  };

  const forwardGeocode = async (index) => {
    const loc = (form.locations || [])[index] || {};

    const hasAnyField = [
      loc.address,
      loc.city,
      loc.region,
      loc.zipCode,
      loc.country,
    ]
      .map((v) => (v || "").trim())
      .some(Boolean);

    if (!hasAnyField) {
      toast.error("Enter address details before locating on the map.");
      return;
    }

    const loadingId = toast.loading("Locating on map...");
    setForwardLoadingIndex(index);
    try {
      const params = new URLSearchParams({
        address: loc.address || "",
        city: loc.city || "",
        region: loc.region || "",
        zipCode: loc.zipCode || "",
        country: loc.country || "",
      });
      const res = await fetch(`/api/geocode/forward?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        toast.error(
          "Address lookup failed. Please adjust details and try again."
        );
        return;
      }
      const data = await res.json();
      if (
        data &&
        typeof data.lat === "number" &&
        typeof data.lng === "number"
      ) {
        updateGeo(index, data.lat, data.lng);
        setModes((m) => ({ ...m, [index]: "map" }));
        toast.success("Pin set from address");
      } else {
        toast.message("No exact match found for this address.");
      }
    } catch (e) {
      toast.error("Failed to locate address. Check your connection.");
    } finally {
      setForwardLoadingIndex(null);
      toast.dismiss(loadingId);
    }
  };

  return (
    <div id="section-locations" className="space-y-5 sm:space-y-6">
      {/* Add Location Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={addLocation}
          className="cursor-pointer px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Locations List */}
      {form.locations?.length > 0 ? (
        <div className="space-y-6">
          {form.locations.map((location, index) => (
            <div key={index} className="space-y-4">
              {/* Location Header */}
              {collapsed[index] ? (
                <CollapsedRow
                  summary={getSummary(location)}
                  onEdit={() => setCollapsedAt(index, false)}
                  onRemove={() => removeLocation(index)}
                  removeDisabled={(form.locations || []).length <= 1}
                />
              ) : (
                <div className="space-y-4 border rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-medium">
                      Location {index + 1}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCollapsedAt(index, true)}
                        className="cursor-pointer"
                      >
                        Collapse
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(index)}
                        className="text-destructive hover:text-destructive cursor-pointer"
                        disabled={(form.locations || []).length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Method Selector */}
                  <MethodSelector
                    idx={index}
                    mode={modes[index]}
                    onModeChange={(m) => onModeChange(index, m)}
                    onLocateMe={onLocateMe}
                    locating={locatingIndex === index}
                    reverseLoading={reverseLoadingIndex === index}
                  />
                  {!collapsed[index] && (
                    <>
                      {/* Address Fields (Sanity schema) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Address</label>
                          <Input
                            value={location.address || ""}
                            onChange={(e) =>
                              updateLocation(index, "address", e.target.value)
                            }
                            placeholder="Street address"
                            className="mt-2"
                          />
                          {getErrorFor(index, "address") ? (
                            <div className="text-xs text-destructive mt-1">
                              {getErrorFor(index, "address")}
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Country</label>
                          <Input
                            value={location.country || ""}
                            onChange={(e) =>
                              updateLocation(index, "country", e.target.value)
                            }
                            placeholder="Country"
                            className="mt-2"
                          />
                          {getErrorFor(index, "country") ? (
                            <div className="text-xs text-destructive mt-1">
                              {getErrorFor(index, "country")}
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <label className="text-sm font-medium">City</label>
                          <Input
                            value={location.city || ""}
                            onChange={(e) =>
                              updateLocation(index, "city", e.target.value)
                            }
                            placeholder="City"
                            className="mt-2"
                          />
                          {getErrorFor(index, "city") ? (
                            <div className="text-xs text-destructive mt-1">
                              {getErrorFor(index, "city")}
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Zip code
                          </label>
                          <Input
                            value={location.zipCode || ""}
                            onChange={(e) =>
                              updateLocation(index, "zipCode", e.target.value)
                            }
                            placeholder="Zip code"
                            className="mt-2"
                          />
                          {getErrorFor(index, "zipCode") ? (
                            <div className="text-xs text-destructive mt-1">
                              {getErrorFor(index, "zipCode")}
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Region</label>
                          <Input
                            value={location.region || ""}
                            onChange={(e) =>
                              updateLocation(index, "region", e.target.value)
                            }
                            placeholder="State/Region"
                            className="mt-2"
                          />
                          {getErrorFor(index, "region") ? (
                            <div className="text-xs text-destructive mt-1">
                              {getErrorFor(index, "region")}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Manual locate from address */}
                      {location.address && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => forwardGeocode(index)}
                            className="cursor-pointer"
                            disabled={
                              locatingIndex === index ||
                              reverseLoadingIndex === index ||
                              forwardLoadingIndex === index
                            }
                          >
                            {forwardLoadingIndex === index
                              ? "Locating..."
                              : "Locate on map"}
                          </Button>
                          {location.geo ? (
                            <div className="text-xs text-muted-foreground self-center">
                              Pinned at {location.geo.lat?.toFixed(4)},{" "}
                              {location.geo.lng?.toFixed(4)}
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Map Section */}
                      {modes[index] === "map" ? (
                        <MapSection
                          value={location.geo}
                          onChange={(lat, lng) =>
                            onMapPinChange(index, lat, lng)
                          }
                          onCollapse={() => onModeChange(index, undefined)}
                          onClear={() => updateGeo(index, null, null)}
                          clearDisabled={!location.geo}
                        />
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No locations added yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first business location to get started
          </p>
        </div>
      )}
    </div>
  );
}
