import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { seedDeviceModels, type SeedDeviceModel } from "@/lib/trade/catalog";

const spreadsheetCandidates = [
  path.join(process.cwd(), "data", "device-pricing.xlsx"),
  path.join(process.cwd(), "data", "device-pricing.xls"),
  path.join(process.cwd(), "data", "device-pricing.csv"),
];

type SpreadsheetRow = {
  id?: string;
  category?: string;
  brand?: string;
  model?: string;
  system_max_brand_new?: number | string;
  system_max_excellent?: number | string;
  system_max_good?: number | string;
  system_max_fair?: number | string;
  system_max_cracked_working?: number | string;
  system_max_cracked_not_working?: number | string;
};

function toNumber(value: number | string | undefined) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function normalizeRow(row: SpreadsheetRow): SeedDeviceModel | null {
  if (!row.id || !row.category || !row.brand || !row.model) {
    return null;
  }

  return {
    id: String(row.id).trim(),
    category: String(row.category).trim() as SeedDeviceModel["category"],
    brand: String(row.brand).trim(),
    model: String(row.model).trim(),
    systemMaxBrandNew: toNumber(row.system_max_brand_new),
    systemMaxExcellent: toNumber(row.system_max_excellent),
    systemMaxGood: toNumber(row.system_max_good),
    systemMaxFair: toNumber(row.system_max_fair),
    systemMaxCrackedWorking: toNumber(row.system_max_cracked_working),
    systemMaxCrackedNotWorking: toNumber(row.system_max_cracked_not_working),
  };
}

function readSpreadsheetCatalog() {
  const filePath = spreadsheetCandidates.find((candidate) => fs.existsSync(candidate));
  if (!filePath) {
    return null;
  }

  const workbook = XLSX.readFile(filePath);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<SpreadsheetRow>(firstSheet, {
    raw: true,
    defval: "",
  });

  const parsedRows = rows
    .map((row) => normalizeRow(row))
    .filter((row): row is SeedDeviceModel => Boolean(row));

  return parsedRows.length > 0 ? parsedRows : null;
}

export function getDeviceCatalogSource() {
  return readSpreadsheetCatalog() ?? seedDeviceModels;
}
