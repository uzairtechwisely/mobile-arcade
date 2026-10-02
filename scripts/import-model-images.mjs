#!/usr/bin/env node
/**
 * Turns a folder of supplied product renders into site-ready model photos and
 * links them to catalog models.
 *
 *   node scripts/import-model-images.mjs <srcDir> <manifest.json> [--dry-run]
 *
 * manifest.json: [{ "file": "<image in srcDir>", "name": "galaxy-s10",
 *                   "models": ["Samsung Galaxy S10"] }, ...]
 *   - "models" are "<Brand> <Model>" labels exactly as in the price list; one
 *     image may serve several models (e.g. "S21 5G / S21+ 5G").
 *   - Any label not found in the catalog aborts the run before anything is written.
 *
 * Per image: crops off the baked-in caption, trims the white border, resizes to
 * 600px wide, writes public/brand/models/<name>.webp, sets image_url on the
 * catalog rows, and records label -> url in data/catalog/model-images.json so a
 * reseed or new price upload keeps the photo.
 *
 * Needs DATABASE_URL / DATABASE_AUTH_TOKEN (read from .env.local if unset).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@libsql/client";

const [srcDir, manifestPath, ...flags] = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");
if (!srcDir || !manifestPath) {
  console.error("Usage: node scripts/import-model-images.mjs <srcDir> <manifest.json> [--dry-run]");
  process.exit(1);
}

function loadEnv() {
  if (process.env.DATABASE_URL) return;
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
loadEnv();

const MODELS_DIR = path.join(process.cwd(), "public", "brand", "models");
const MAP_FILE = path.join(process.cwd(), "data", "catalog", "model-images.json");

// Walk up from the bottom: trailing white -> caption text -> white gap -> phone.
// Returns the row where the phone content resumes, i.e. where to crop.
async function findContentBottom(buf) {
  const { data, info } = await sharp(buf).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const density = (y) => {
    let n = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) n++;
    }
    return n;
  };
  let state = "below";
  let lowRun = 0;
  for (let y = h - 1; y >= 0; y--) {
    const n = density(y);
    if (state === "below") {
      if (n > 15) state = "caption";
    } else if (state === "caption") {
      if (n <= 15) {
        if (++lowRun >= 8) state = "gap";
      } else lowRun = 0;
    } else if (n > 80) return y + 1;
  }
  return h;
}

async function processImage(file) {
  const buf = fs.readFileSync(path.join(srcDir, file));
  const meta = await sharp(buf).metadata();
  const bottom = await findContentBottom(buf);
  // extract and trim are separate steps: chaining them in one sharp pipeline fails.
  const noCaption = await sharp(buf)
    .extract({ left: 0, top: 0, width: meta.width, height: Math.min(bottom, meta.height) })
    .toBuffer();
  const trimmed = await sharp(noCaption).trim({ background: "#ffffff", threshold: 12 }).toBuffer();
  return sharp(trimmed).resize({ width: 600 }).webp({ quality: 88 }).toBuffer();
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const db = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });

const catalog = await db.execute("SELECT id, brand, model FROM catalog_models");
const idByLabel = new Map(catalog.rows.map((r) => [`${r.brand} ${r.model}`.toLowerCase(), String(r.id)]));

const unknown = [];
for (const item of manifest) {
  if (!fs.existsSync(path.join(srcDir, item.file))) unknown.push(`missing file: ${item.file}`);
  for (const label of item.models) {
    if (!idByLabel.has(label.toLowerCase())) unknown.push(`not in catalog: "${label}"`);
  }
}
if (unknown.length) {
  console.error("Aborting, nothing written:\n  " + unknown.join("\n  "));
  process.exit(1);
}

const urlByLabel = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, "utf8")) : {};
const updates = [];
for (const item of manifest) {
  const url = `/brand/models/${item.name}.webp`;
  if (!dryRun) fs.writeFileSync(path.join(MODELS_DIR, `${item.name}.webp`), await processImage(item.file));
  for (const label of item.models) {
    urlByLabel[label.toLowerCase()] = url;
    updates.push({
      sql: "UPDATE catalog_models SET image_url = ?, updated_at = ? WHERE id = ?",
      args: [url, new Date().toISOString(), idByLabel.get(label.toLowerCase())],
    });
  }
  console.log(`${dryRun ? "[dry run] " : ""}${item.name}.webp -> ${item.models.join(", ")}`);
}

if (!dryRun) {
  const sorted = Object.fromEntries(Object.entries(urlByLabel).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(MAP_FILE, JSON.stringify(sorted, null, 2) + "\n");
  await db.batch(updates, "write");
}

const left = await db.execute(
  "SELECT brand, COUNT(*) AS n FROM catalog_models WHERE active = 1 AND (image_url IS NULL OR image_url = '') GROUP BY brand ORDER BY brand",
);
console.log("\nStill without a photo:", left.rows.map((r) => `${r.brand} ${r.n}`).join(", ") || "none");
