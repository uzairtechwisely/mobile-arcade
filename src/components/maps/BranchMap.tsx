"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useMemo, useRef, useState } from "react";
import { Branch } from "@/lib/types";

export function BranchMap({
  branches,
  allBranches,
  activeBranchIds,
  selectedBranchId,
  onSelectBranchId,
  origin,
  className,
}: {
  branches: Branch[];
  allBranches?: Branch[];
  activeBranchIds?: string[];
  selectedBranchId?: string;
  onSelectBranchId?: (id: string) => void;
  origin?: { lat: number; lng: number };
  className?: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  const displayBranches = allBranches ?? branches;
  const activeSet = useMemo(() => {
    return activeBranchIds ? new Set(activeBranchIds) : null;
  }, [activeBranchIds]);

  const selectedBranchName = useMemo(() => {
    if (!selectedBranchId) return null;
    return displayBranches.find((b) => b.id === selectedBranchId)?.name ?? null;
  }, [displayBranches, selectedBranchId]);

  const center = useMemo(() => {
    if (origin) return origin;
    const first = displayBranches[0];
    return first ? { lat: first.lat, lng: first.lng } : { lat: 52.6309, lng: 1.2974 };
  }, [displayBranches, origin]);

  useEffect(() => {
    if (!apiKey) return;
    if (!mapRef.current) return;

    let isCancelled = false;
    setStatus("loading");

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        if (isCancelled) return;
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });

        const bounds = new google.maps.LatLngBounds();

        const addMarker = (b: Branch) => {
          const pos = { lat: b.lat, lng: b.lng };
          bounds.extend(pos);
          const isActive = activeSet ? activeSet.has(b.id) : true;

          const marker = new google.maps.Marker({
            map,
            position: pos,
            title: b.name,
            opacity: isActive ? 1 : 0.35,
          });

          marker.addListener("click", () => onSelectBranchId?.(b.id));
        };

        displayBranches.forEach(addMarker);

        if (origin) {
          bounds.extend(origin);
          new google.maps.Marker({
            map,
            position: origin,
            title: "You are here",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: "rgb(0, 179, 164)",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });
        }

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, 80);
        }

        setStatus("ready");
      })
      .catch(() => {
        if (isCancelled) return;
        setStatus("error");
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSet, apiKey, center, displayBranches, onSelectBranchId, origin]);

  if (!apiKey) {
    return (
      <div
        className={`rounded-3xl border border-border bg-surface p-6 text-sm text-muted ${className ?? ""}`}
      >
        Map needs a Google Maps API key.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className={`rounded-3xl border border-border bg-surface p-6 text-sm text-muted ${className ?? ""}`}
      >
        Map failed to load. Check the key and enabled Google Maps APIs.
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border bg-surface ${className ?? ""}`}
    >
      <div ref={mapRef} className="h-[420px] w-full" />
      {selectedBranchName ? (
        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-foreground px-3 py-2 text-xs font-semibold text-background shadow">
          {selectedBranchName}
        </div>
      ) : null}
      {status !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center bg-background/60 text-sm font-semibold text-foreground backdrop-blur">
          Loading map…
        </div>
      ) : null}
    </div>
  );
}
