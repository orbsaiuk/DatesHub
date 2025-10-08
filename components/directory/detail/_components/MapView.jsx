"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/ui/spinner";
import dynamic from "next/dynamic";

// Create a dynamic component that loads the entire map on client-side only
const ClientOnlyMap = dynamic(() => import("./ClientOnlyMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", width: "100%" }}>
      <div className="p-6 h-full w-full flex items-center justify-center">
        <div className="w-full max-w-md relative">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function MapView(props) {
  return <ClientOnlyMap {...props} />;
}
