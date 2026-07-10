import { Container } from "@/components/ui/Container";
import { branches } from "@/data/branches";
import { services } from "@/data/services";
import { ServiceFinderClient } from "./service-finder-client";

export default async function ServiceFinderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const serviceKeyParam = sp.service;
  const serviceKey =
    typeof serviceKeyParam === "string" ? serviceKeyParam : undefined;
  const modeParam = sp.mode;
  const mode = typeof modeParam === "string" ? modeParam : undefined;
  const postcodeParam = sp.postcode;
  const postcode =
    typeof postcodeParam === "string" ? postcodeParam : undefined;

  const resolvedServiceKey =
    services.find((s) => s.key === serviceKey)?.key ?? services[0]?.key;

  let initialOrigin: { lat: number; lng: number } | null = null;
  let initialDriving:
    | { metersByBranchId: Record<string, number>; secondsByBranchId: Record<string, number> }
    | null = null;

  const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (postcode && serverKey && resolvedServiceKey) {
    const candidates = branches.filter((b) =>
      b.services.includes(resolvedServiceKey as never),
    );
    if (candidates.length) {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        postcode,
      )}&key=${encodeURIComponent(serverKey)}`;
      const geoRes = await fetch(geoUrl, { cache: "no-store" }).catch(() => null);
      const geoJson = geoRes ? await geoRes.json().catch(() => null) : null;
      const loc = geoJson?.results?.[0]?.geometry?.location;

      if (typeof loc?.lat === "number" && typeof loc?.lng === "number") {
        initialOrigin = { lat: loc.lat, lng: loc.lng };

        const destinations = candidates
          .map((b) => `${b.lat},${b.lng}`)
          .join("|");
        const distUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
          `${loc.lat},${loc.lng}`,
        )}&destinations=${encodeURIComponent(destinations)}&key=${encodeURIComponent(
          serverKey,
        )}&mode=driving`;

        const distRes = await fetch(distUrl, { cache: "no-store" }).catch(() => null);
        const distJson = distRes ? await distRes.json().catch(() => null) : null;
        const elements = distJson?.rows?.[0]?.elements;

        if (Array.isArray(elements) && elements.length === candidates.length) {
          const metersByBranchId: Record<string, number> = {};
          const secondsByBranchId: Record<string, number> = {};
          for (let i = 0; i < candidates.length; i += 1) {
            const el = elements[i];
            if (el?.status === "OK" && typeof el?.distance?.value === "number") {
              metersByBranchId[candidates[i].id] = el.distance.value;
              secondsByBranchId[candidates[i].id] =
                typeof el?.duration?.value === "number" ? el.duration.value : 0;
            }
          }
          initialDriving = { metersByBranchId, secondsByBranchId };
        }
      }
    }
  }

  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Service finder</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Select the service you need, enter your postcode, and we’ll show the
            nearest branches on the map.
          </p>
        </div>

        <div className="mt-10">
          <ServiceFinderClient
            branches={branches}
            services={services}
            defaultServiceKey={serviceKey}
            defaultMode={mode}
            defaultPostcode={postcode}
            initialOrigin={initialOrigin}
            initialDriving={initialDriving}
          />
        </div>
      </Container>
    </div>
  );
}
