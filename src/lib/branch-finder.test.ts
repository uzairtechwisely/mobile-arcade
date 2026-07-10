import { describe, expect, it } from "vitest";
import { getNearestBranches } from "@/lib/branch-finder";

describe("branch finder", () => {
  it("returns branches sorted by distance", () => {
    const origin = { lat: 52.6309, lng: 1.2974 };
    const ordered = getNearestBranches(origin);
    expect(ordered.length).toBeGreaterThan(0);
    expect(ordered[0].branch.id).toBe("norwich");
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].distanceMeters).toBeGreaterThanOrEqual(
        ordered[i - 1].distanceMeters,
      );
    }
  });
});

