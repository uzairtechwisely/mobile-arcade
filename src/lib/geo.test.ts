import { describe, expect, it } from "vitest";
import { haversineDistanceMeters, metersToMiles } from "@/lib/geo";

describe("geo", () => {
  it("computes haversine distance in a plausible range", () => {
    const norwich = { lat: 52.6309, lng: 1.2974 };
    const diss = { lat: 52.376, lng: 1.109 };
    const meters = haversineDistanceMeters(norwich, diss);
    const miles = metersToMiles(meters);
    expect(miles).toBeGreaterThan(5);
    expect(miles).toBeLessThan(40);
  });
});

