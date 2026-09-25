import * as XLSX from "xlsx";
import type { DeviceCategory } from "@/lib/trade/shared";

/**
 * Price-list parsing, shared by the seed loader and (later) the store admin
 * panel's upload endpoint. Pure: no database access, so it is easy to test and
 * to run as a "preview before you apply" step.
 *
 * Accepted columns (header names are case-insensitive, spaces/underscores ignored):
 *   brand, device_model, storage, condition, offer_gbp   (required)
 *   category                                              (optional, default "phone")
 *
 * One row = one price for one model + storage + condition. The file is the
 * source of truth: to add a device, add rows; to change a price, change a row.
 */

// Devices worth this much or less in any condition are not worth listing, so a
// storage size with a price at or below it is left out (e.g. £1 placeholders).
export const MAX_UNLISTED_PRICE_GBP = 1;

export const PRICED_CONDITIONS = ["brand_new", "excellent", "good", "cracked_not_working"] as const;
export type PricedCondition = (typeof PRICED_CONDITIONS)[number];

// The customer-facing "Damaged" tile is stored as cracked_not_working.
const CONDITION_ALIASES: Record<string, PricedCondition> = {
  brandnew: "brand_new",
  new: "brand_new",
  excellent: "excellent",
  good: "good",
  damaged: "cracked_not_working",
  crackednotworking: "cracked_not_working",
};

const CATEGORY_ALIASES: Record<string, DeviceCategory> = {
  phone: "phone",
  phones: "phone",
  laptop: "laptop",
  laptops: "laptop",
  tablet: "tablet",
  tablets: "tablet",
  gamingdevice: "gaming_device",
  gaming: "gaming_device",
};

export type PriceListModel = {
  id: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  sortOrder: number;
  // storage label -> price per condition
  variants: Array<{ storage: string; prices: Record<PricedCondition, number> }>;
};

export type PriceListIssue = { row: number | null; message: string };

export type ParsedPriceList = {
  models: PriceListModel[];
  rowCount: number;
  issues: PriceListIssue[];
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function modelIdFor(category: DeviceCategory, brand: string, model: string) {
  // Phones keep the short "brand-model" id; other categories are prefixed so a
  // future "Apple iPad" cannot collide with a phone of the same name.
  const base = `${slugify(brand)}-${slugify(model)}`;
  return category === "phone" ? base : `${category}-${base}`;
}

const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function normalizeStorage(value: string) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(gb|tb)$/i);
  return match ? `${match[1]}${match[2].toUpperCase()}` : null;
}

export function storageToGb(storage: string) {
  const match = storage.match(/^(\d+(?:\.\d+)?)(GB|TB)$/);
  if (!match) return 0;
  return Number(match[1]) * (match[2] === "TB" ? 1024 : 1);
}

export function parsePriceListFile(data: Buffer | ArrayBuffer | string): ParsedPriceList {
  const workbook =
    typeof data === "string" ? XLSX.read(data, { type: "string" }) : XLSX.read(data, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = sheet
    ? XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: true, defval: "" })
    : [];
  return parsePriceListRows(rawRows);
}

export function parsePriceListRows(rawRows: Array<Record<string, unknown>>): ParsedPriceList {
  const issues: PriceListIssue[] = [];
  const byModel = new Map<
    string,
    {
      model: Omit<PriceListModel, "variants">;
      storages: Map<string, Partial<Record<PricedCondition, number>>>;
    }
  >();

  if (rawRows.length === 0) {
    return { models: [], rowCount: 0, issues: [{ row: null, message: "The file has no data rows." }] };
  }

  const headerLookup = new Map<string, string>();
  for (const header of Object.keys(rawRows[0])) headerLookup.set(key(header), header);
  const missing = ["brand", "devicemodel", "storage", "condition", "offergbp"].filter(
    (name) => !headerLookup.has(name),
  );
  if (missing.length > 0) {
    return {
      models: [],
      rowCount: rawRows.length,
      issues: [
        {
          row: null,
          message: `Missing required column(s): ${missing.join(", ")}. Expected brand, device_model, storage, condition, offer_gbp.`,
        },
      ],
    };
  }

  const cell = (row: Record<string, unknown>, name: string) => {
    const header = headerLookup.get(name);
    return header ? String(row[header] ?? "").trim() : "";
  };

  rawRows.forEach((raw, index) => {
    const rowNumber = index + 2; // header is row 1
    const brand = cell(raw, "brand");
    const modelName = cell(raw, "devicemodel");
    const storageRaw = cell(raw, "storage");
    const conditionRaw = cell(raw, "condition");
    const priceRaw = cell(raw, "offergbp");
    const categoryRaw = cell(raw, "category");

    if (!brand && !modelName && !storageRaw && !conditionRaw && !priceRaw) return; // blank line

    const category = categoryRaw ? CATEGORY_ALIASES[key(categoryRaw)] : "phone";
    const storage = normalizeStorage(storageRaw);
    const condition = CONDITION_ALIASES[key(conditionRaw)];
    const price = Number(priceRaw.replace(/[£,]/g, ""));

    if (!brand || !modelName) return void issues.push({ row: rowNumber, message: "Missing brand or device model." });
    if (!category) return void issues.push({ row: rowNumber, message: `Unknown category "${categoryRaw}".` });
    if (!storage) return void issues.push({ row: rowNumber, message: `${brand} ${modelName}: unrecognised storage "${storageRaw}".` });
    if (!condition) return void issues.push({ row: rowNumber, message: `${brand} ${modelName}: unknown condition "${conditionRaw}".` });
    if (!priceRaw || !Number.isFinite(price) || price < 0) {
      return void issues.push({
        row: rowNumber,
        message: `${brand} ${modelName} ${storage} ${conditionRaw}: missing or invalid price.`,
      });
    }

    const id = modelIdFor(category, brand, modelName);
    let entry = byModel.get(id);
    if (!entry) {
      entry = {
        model: { id, category, brand, model: modelName, sortOrder: byModel.size },
        storages: new Map(),
      };
      byModel.set(id, entry);
    }
    const prices = entry.storages.get(storage) ?? {};
    prices[condition] = Math.round(price);
    entry.storages.set(storage, prices);
  });

  const models: PriceListModel[] = [];
  let lowValueRemoved = 0;
  for (const { model, storages } of byModel.values()) {
    const variants: PriceListModel["variants"] = [];
    for (const [storage, prices] of storages) {
      const absent = PRICED_CONDITIONS.filter((condition) => prices[condition] === undefined);
      if (absent.length > 0) {
        // A storage size with any condition unpriced would break quoting, so it
        // is not listed at all until the file is complete for it.
        issues.push({
          row: null,
          message: `${model.brand} ${model.model} ${storage} not listed: no price for ${absent.join(", ")}.`,
        });
        continue;
      }
      const p = prices as Record<PricedCondition, number>;
      if (PRICED_CONDITIONS.some((condition) => p[condition] <= MAX_UNLISTED_PRICE_GBP)) {
        lowValueRemoved += 1;
        continue;
      }
      variants.push({ storage, prices: p });
      if (!(p.brand_new >= p.excellent && p.excellent >= p.good && p.good >= p.cracked_not_working)) {
        issues.push({
          row: null,
          message: `Check ${model.brand} ${model.model} ${storage}: prices do not fall in order from Brand New down to Damaged.`,
        });
      }
    }
    if (variants.length === 0) {
      issues.push({ row: null, message: `${model.brand} ${model.model} not listed: no listable prices.` });
      continue;
    }
    variants.sort((a, b) => storageToGb(a.storage) - storageToGb(b.storage));
    models.push({ ...model, variants });
  }

  if (lowValueRemoved > 0) {
    issues.push({
      row: null,
      message: `${lowValueRemoved} storage size(s) not listed because a price was £${MAX_UNLISTED_PRICE_GBP} or less.`,
    });
  }

  return { models, rowCount: rawRows.length, issues };
}
