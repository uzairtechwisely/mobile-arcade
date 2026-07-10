export function haversineDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;

  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function metersToMiles(meters: number) {
  return meters / 1609.344;
}

export function formatMiles(miles: number) {
  if (!Number.isFinite(miles)) return "—";
  if (miles < 0.1) return "<0.1 mi";
  return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
}
