"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Filters({
  categories = [],
  initialFilters,
  cities = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(initialFilters?.loc || "");
  const [locationQuery, setLocationQuery] = useState("");
  const [specializationQuery, setSpecializationQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(
    initialFilters?.spec || ""
  );
  const [companyType, setCompanyType] = useState(
    initialFilters?.ctype || "all"
  );
  const [isApplying, setIsApplying] = useState(false);
  const [dirty, setDirty] = useState(false);

  const filteredCategories = useMemo(() => {
    const q = specializationQuery.trim().toLowerCase();
    const list = Array.isArray(categories) ? categories : [];
    if (!q) return list;
    return list.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [specializationQuery, categories]);

  const filteredCities = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    const list = Array.isArray(cities) ? cities : [];
    if (!q) return list;
    return list.filter((cr) => (cr || "").toLowerCase().includes(q));
  }, [locationQuery, cities]);

  const selectedLabel = useMemo(() => {
    if (!selectedSpecialization) return "Category";
    return (
      categories.find((c) => c.slug === selectedSpecialization)?.title ||
      selectedSpecialization
    );
  }, [selectedSpecialization, categories]);

  useEffect(() => {
    setLocation(searchParams?.get("loc") || "");
    setSelectedSpecialization(searchParams?.get("spec") || "");
    setCompanyType(searchParams?.get("ctype") || "all");
    setDirty(false);
  }, [searchParams]);

  const applyFilters = () => {
    setIsApplying(true);
    const params = new URLSearchParams(window.location.search);
    if (location.trim()) params.set("loc", location.trim());
    else params.delete("loc");
    if (selectedSpecialization) params.set("spec", selectedSpecialization);
    else params.delete("spec");
    if (companyType && companyType !== "all") params.set("ctype", companyType);
    else params.delete("ctype");
    router.push(
      `/companies${params.toString() ? `?${params.toString()}` : ""}`
    );
    setTimeout(() => setIsApplying(false), 600);
  };

  return (
    <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mx-auto px-4">
      {/* Location */}
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <Input
                placeholder="Location (City or Region)"
                className="bg-gray-100 pl-9 h-10 cursor-pointer"
                value={location}
                readOnly
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder="Search city or region"
                  className="pl-8 h-9"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
              <div className="rounded-md border">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                  City, Region
                </div>
                <ul className="divide-y max-h-56 overflow-y-auto">
                  {filteredCities.map((cr) => (
                    <li key={cr}>
                      <button
                        type="button"
                        onClick={() => {
                          setLocation(cr);
                          setDirty(true);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                      >
                        {cr}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Category (searchable popover) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-10 w-full justify-between bg-gray-100"
          >
            <span className="font-normal">{selectedLabel}</span>
            <ChevronDown className="size-4 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Search"
                className="pl-8 h-9"
                value={specializationQuery}
                onChange={(e) => setSpecializationQuery(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-md border">
              <ul className="divide-y">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedSpecialization === cat.slug;
                  return (
                    <li key={cat._id || cat.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSpecialization(cat.slug);
                          setDirty(true);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent"
                        aria-pressed={isSelected}
                      >
                        <span
                          aria-hidden
                          className={`inline-flex size-4 items-center justify-center rounded-full border ${
                            isSelected ? "border-primary" : "border-input"
                          }`}
                        >
                          <span
                            className={`block size-2 rounded-full ${
                              isSelected ? "bg-primary" : "bg-transparent"
                            }`}
                          />
                        </span>
                        <Label className="cursor-pointer text-sm">
                          {cat.title}
                        </Label>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Event Type */}
      <Select
        value={companyType}
        onValueChange={(v) => {
          setCompanyType(v);
          setDirty(true);
        }}
      >
        <SelectTrigger className="h-10 w-full bg-gray-100 justify-between">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Event Type:</span>
            <SelectValue placeholder="All" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="full-event-planner">Full Event Planner</SelectItem>
          <SelectItem value="kids-birthday">Kids Birthday</SelectItem>
          <SelectItem value="wedding">Wedding</SelectItem>
          <SelectItem value="social-gathering">Social Gathering</SelectItem>
          <SelectItem value="corporate-event">Corporate Event</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-stretch justify-end gap-2">
        <Button
          onClick={applyFilters}
          className="cursor-pointer h-10"
          variant="outline"
          disabled={isApplying}
        >
          {isApplying
            ? "Applying..."
            : dirty
              ? "Apply Filters"
              : "Filters Applied"}
        </Button>
        <Button
          onClick={() => {
            setLocation("");
            setSelectedSpecialization("");
            setCompanyType("all");
            router.push("/companies");
          }}
          className="cursor-pointer h-10"
          variant="ghost"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
