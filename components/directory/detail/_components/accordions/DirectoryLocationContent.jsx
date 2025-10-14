import DirectoryMap from "../DirectoryMap";
import { MapPin } from "lucide-react";

export default function DirectoryLocationContent({ tenant }) {
  const allMarkers = Array.isArray(tenant?.locations) ? tenant.locations : [];
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="aspect-[4/3] sm:aspect-[16/6] w-full rounded-xl overflow-hidden">
        <DirectoryMap tenant={tenant} />
      </div>
      <div className="p-3">
        <div className="rounded-md border bg-white p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="size-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">المواقع</p>
          </div>
          {Array.isArray(tenant?.locationList) ? (
            <ul className="mt-1 space-y-1">
              {tenant.locationList.map((locStr, i) => {
                const marker = allMarkers[i];
                const searchQ = encodeURIComponent(locStr || "");
                return (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <span>- {i + 1}</span>
                    <span style={{ direction: "ltr" }}>{locStr}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${searchQ}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      البحث في الخرائط
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
