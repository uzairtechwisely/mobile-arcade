import { randomUUID } from "node:crypto";
import type { Client, InStatement } from "@libsql/client";
import { DEFAULT_FEATURED_MODEL_IDS, defaultImageFor } from "@/lib/trade/catalog-images";
import type { ParsedPriceList } from "@/lib/trade/price-list";

export type ApplyMode = "replace" | "merge";

export type ApplyReport = {
  applied: boolean;
  mode: ApplyMode;
  modelsInFile: number;
  modelsAdded: number;
  modelsUpdated: number;
  modelsDeactivated: number;
  priceRows: number;
  issues: ParsedPriceList["issues"];
};

/**
 * Applies a parsed price list to the catalog. This is the single write path for
 * pricing: the first-run seed, the CLI and the future store-admin upload all call it.
 *
 *  - "replace": the file is the source of truth for every category it contains.
 *    Models in those categories that are absent from the file are switched off
 *    (kept in the database, hidden from customers) so history is never lost.
 *  - "merge": only the models in the file are touched.
 *
 * Existing quotes store the price they were given, so a price change never alters
 * a quote a customer already holds. Images and the featured flag are only set when
 * a model is first created, so uploads do not overwrite admin-panel edits.
 */
export async function applyPriceList(
  db: Client,
  parsed: ParsedPriceList,
  options: { mode?: ApplyMode; source?: string; dryRun?: boolean } = {},
): Promise<ApplyReport> {
  const mode = options.mode ?? "replace";
  const now = new Date().toISOString();

  const existing = await db.execute("SELECT id, category, active FROM catalog_models");
  const existingById = new Map(existing.rows.map((row) => [String(row.id), row]));

  const fileIds = new Set(parsed.models.map((model) => model.id));
  const categoriesInFile = new Set(parsed.models.map((model) => model.category));

  const toDeactivate =
    mode === "replace"
      ? existing.rows
          .filter(
            (row) =>
              categoriesInFile.has(String(row.category) as never) &&
              !fileIds.has(String(row.id)) &&
              Number(row.active) === 1,
          )
          .map((row) => String(row.id))
      : [];

  const report: ApplyReport = {
    applied: false,
    mode,
    modelsInFile: parsed.models.length,
    modelsAdded: parsed.models.filter((model) => !existingById.has(model.id)).length,
    modelsUpdated: parsed.models.filter((model) => existingById.has(model.id)).length,
    modelsDeactivated: toDeactivate.length,
    priceRows: parsed.models.reduce((sum, model) => sum + model.variants.length * 4, 0),
    issues: parsed.issues,
  };

  if (options.dryRun || parsed.models.length === 0) return report;

  const importId = randomUUID();
  const statements: InStatement[] = [
    {
      sql: `INSERT INTO price_imports (id, source, mode, models_in_file, models_added, models_updated,
              models_deactivated, price_rows, issues_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        importId,
        options.source ?? "unknown",
        mode,
        report.modelsInFile,
        report.modelsAdded,
        report.modelsUpdated,
        report.modelsDeactivated,
        report.priceRows,
        JSON.stringify(parsed.issues.slice(0, 200)),
        now,
      ],
    },
  ];

  for (const model of parsed.models) {
    statements.push({
      sql: `INSERT INTO catalog_models (id, category, brand, model, image_url, featured, sort_order, search_text, active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              category = excluded.category,
              brand = excluded.brand,
              model = excluded.model,
              sort_order = excluded.sort_order,
              search_text = excluded.search_text,
              active = 1,
              updated_at = excluded.updated_at`,
      args: [
        model.id,
        model.category,
        model.brand,
        model.model,
        defaultImageFor(model.brand, model.model),
        DEFAULT_FEATURED_MODEL_IDS.has(model.id) ? 1 : 0,
        model.sortOrder,
        `${model.brand} ${model.model}`.toLowerCase(),
        now,
        now,
      ],
    });
    // Exact replacement: drop the model's old prices, write the file's.
    statements.push({ sql: "DELETE FROM catalog_prices WHERE model_id = ?", args: [model.id] });
    for (const variant of model.variants) {
      for (const [condition, price] of Object.entries(variant.prices)) {
        statements.push({
          sql: `INSERT INTO catalog_prices (model_id, storage, condition, price_gbp, import_id, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [model.id, variant.storage, condition, price, importId, now],
        });
      }
    }
  }

  for (const id of toDeactivate) {
    statements.push({ sql: "UPDATE catalog_models SET active = 0, updated_at = ? WHERE id = ?", args: [now, id] });
  }

  await db.batch(statements, "write");
  report.applied = true;
  return report;
}
