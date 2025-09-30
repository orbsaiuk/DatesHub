import DirectoryMap from "../DirectoryMap";

export default function DirectoryLocationContent({ company }) {
  const allMarkers = Array.isArray(company?.locations) ? company.locations : [];
  const hasHours =
    Array.isArray(company?.openingHours) && company.openingHours.length > 0;
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="aspect-[4/3] sm:aspect-[16/6] w-full rounded-xl overflow-hidden">
        <DirectoryMap company={company} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3">
        <div className="rounded-md border bg-white p-3 col-span-1 sm:col-span-2">
          <p className="text-xs text-muted-foreground">المواقع</p>
          {Array.isArray(company?.locationList) ? (
            <ul className="mt-1 space-y-1">
              {company.locationList.map((locStr, i) => {
                const marker = allMarkers[i];
                const searchQ = encodeURIComponent(locStr || "");
                return (
                  <li key={i} className="text-xs text-muted-foreground">
                    <span>
                      {i + 1}. {locStr} -{" "}
                    </span>
                    {marker ? (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        الاتجاهات
                      </a>
                    ) : locStr ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${searchQ}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        البحث في الخرائط
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        <div className="rounded-md border bg-white p-3">
          <p className="text-xs text-muted-foreground">ساعات العمل</p>
          {hasHours ? (
            <div className="mt-1">
              {company.openingHours.map((line, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
