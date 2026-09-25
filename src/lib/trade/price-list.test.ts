import { describe, expect, it } from "vitest";
import { parsePriceListFile } from "@/lib/trade/price-list";

const header = "brand,device_model,storage,condition,offer_gbp\n";
const rows = (model: string, storage: string, p: [number | string, number | string, number | string, number | string]) =>
  ["Brand New", "Excellent", "Good", "Damaged"].map((c, i) => `Apple,${model},${storage},${c},${p[i]}`).join("\n") + "\n";

describe("parsePriceListFile", () => {
  it("groups rows into models with storage variants and maps Damaged", () => {
    const result = parsePriceListFile(header + rows("iPhone 15", "256GB", [500, 450, 400, 150]) + rows("iPhone 15", "128GB", [450, 400, 350, 120]));
    expect(result.models).toHaveLength(1);
    expect(result.models[0].id).toBe("apple-iphone-15");
    expect(result.models[0].variants.map((v) => v.storage)).toEqual(["128GB", "256GB"]);
    expect(result.models[0].variants[1].prices).toEqual({ brand_new: 500, excellent: 450, good: 400, cracked_not_working: 150 });
  });

  it("does not list blank-priced or incomplete storage sizes", () => {
    const result = parsePriceListFile(header + rows("Galaxy A70s", "128GB", ["", "", "", ""]));
    expect(result.models).toHaveLength(0);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("removes storage sizes with a price of £1 or less", () => {
    const result = parsePriceListFile(header + rows("Galaxy A10", "32GB", [5, 5, 5, 1]) + rows("Galaxy A20", "64GB", [40, 30, 20, 5]));
    expect(result.models.map((m) => m.model)).toEqual(["Galaxy A20"]);
  });

  it("rejects files missing required columns", () => {
    const result = parsePriceListFile("brand,model\nApple,iPhone");
    expect(result.models).toHaveLength(0);
    expect(result.issues[0].message).toMatch(/Missing required column/);
  });
});
