import { branches } from "@/data/branches";
import { haversineDistanceMeters } from "@/lib/geo";

export function getNearestBranches(origin: { lat: number; lng: number }) {
  return branches
    .map((b) => ({
      branch: b,
      distanceMeters: haversineDistanceMeters(origin, { lat: b.lat, lng: b.lng }),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
