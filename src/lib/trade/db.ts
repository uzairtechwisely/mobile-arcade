import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { applyPriceList } from "@/lib/trade/catalog-store";
import { parsePriceListFile } from "@/lib/trade/price-list";

function getLocalDatabasePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "mobile-arcade.db");
  }

  return path.join(process.cwd(), ".data", "mobile-arcade.db");
}

const localDatabasePath = getLocalDatabasePath();
const databaseUrl = process.env.DATABASE_URL ?? `file:${localDatabasePath}`;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (databaseUrl.startsWith("file:")) {
  fs.mkdirSync(path.dirname(localDatabasePath), { recursive: true });
}

const client = createClient(
  authToken ? { url: databaseUrl, authToken } : { url: databaseUrl },
);

let initPromise: Promise<void> | null = null;

async function createTables(db: Client) {
  // Catalog: one row per model, one price row per model + storage + condition.
  // Populated only through applyPriceList (seed file today, admin upload later).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS catalog_models (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      image_url TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      search_text TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS catalog_prices (
      model_id TEXT NOT NULL,
      storage TEXT NOT NULL,
      condition TEXT NOT NULL,
      price_gbp INTEGER NOT NULL,
      import_id TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (model_id, storage, condition),
      FOREIGN KEY (model_id) REFERENCES catalog_models(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS price_imports (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      mode TEXT NOT NULL,
      models_in_file INTEGER NOT NULL,
      models_added INTEGER NOT NULL,
      models_updated INTEGER NOT NULL,
      models_deactivated INTEGER NOT NULL,
      price_rows INTEGER NOT NULL,
      issues_json TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      device_model_id TEXT NOT NULL,
      device_category TEXT NOT NULL,
      device_condition TEXT NOT NULL,
      requested_amount_gbp INTEGER NOT NULL,
      system_maximum_gbp INTEGER NOT NULL,
      cash_offer_gbp INTEGER NOT NULL,
      offer_status TEXT NOT NULL,
      flow_mode TEXT NOT NULL DEFAULT 'auto_accept_with_bonus',
      reward_type TEXT,
      reward_label TEXT,
      reward_value_gbp INTEGER,
      reward_is_cash INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (device_model_id) REFERENCES catalog_models(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL UNIQUE,
      trade_reference_id TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      collection_address TEXT NOT NULL,
      bank_account_name TEXT NOT NULL,
      bank_sort_code TEXT NOT NULL,
      bank_account_number TEXT NOT NULL,
      postage_service TEXT NOT NULL,
      postage_tracking_reference TEXT,
      estimated_postage_cost_gbp INTEGER NOT NULL,
      postage_reimbursement_gbp INTEGER NOT NULL,
      terms_accepted INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (quote_id) REFERENCES quotes(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS support_requests (
      id TEXT PRIMARY KEY,
      device_category TEXT NOT NULL,
      model_query TEXT,
      requested_amount_gbp INTEGER,
      device_condition TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_mobile TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS email_log (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      reference TEXT,
      status TEXT NOT NULL,
      error TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS stripe_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      quote_id TEXT,
      payment_intent_id TEXT,
      amount_total INTEGER,
      currency TEXT,
      payment_status TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_catalog_models_category ON catalog_models(category, active)",
  );
  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_catalog_models_search ON catalog_models(search_text)",
  );

  try {
    await db.execute(
      "ALTER TABLE quotes ADD COLUMN flow_mode TEXT NOT NULL DEFAULT 'auto_accept_with_bonus'",
    );
  } catch {
    // Column already exists in previously initialized databases.
  }

  try {
    await db.execute("ALTER TABLE support_requests ADD COLUMN storage_option TEXT");
  } catch {
    // Column already exists in previously initialized databases.
  }

  try {
    await db.execute("ALTER TABLE quotes ADD COLUMN storage_option TEXT");
  } catch {
    // Column already exists in previously initialized databases.
  }

  try {
    await db.execute("ALTER TABLE device_models ADD COLUMN image_url TEXT");
  } catch {
    // Column already exists in previously initialized databases.
  }

  try {
    await db.execute("ALTER TABLE quotes ADD COLUMN colour_option TEXT");
  } catch {
    // Column already exists in previously initialized databases.
  }

  try {
    await db.execute(
      "ALTER TABLE trades ADD COLUMN has_own_packaging INTEGER NOT NULL DEFAULT 1",
    );
  } catch {
    // Column already exists in previously initialized databases.
  }

  try {
    await db.execute(
      "ALTER TABLE trades ADD COLUMN postage_pack_purchased INTEGER NOT NULL DEFAULT 0",
    );
  } catch {
    // Column already exists in previously initialized databases.
  }

  try {
    await db.execute(
      "ALTER TABLE trades ADD COLUMN postage_pack_stripe_payment_intent_id TEXT",
    );
  } catch {
    // Column already exists in previously initialized databases.
  }

  try {
    await db.execute("ALTER TABLE trades ADD COLUMN postage_pack_shipping_address TEXT");
  } catch {
    // Column already exists in previously initialized databases.
  }
}

// First run only: load the bundled price list so a fresh database is never empty.
// Later price changes go through applyPriceList (admin upload / CLI), not this file.
async function seedDatabase(db: Client) {
  const count = await db.execute("SELECT COUNT(*) AS n FROM catalog_models");
  if (Number(count.rows[0]?.n ?? 0) > 0) return;

  const seedFile = path.join(process.cwd(), "data", "catalog", "phones-price-list.csv");
  if (!fs.existsSync(seedFile)) return;

  await applyPriceList(db, parsePriceListFile(fs.readFileSync(seedFile)), {
    mode: "merge",
    source: "seed:phones-price-list.csv",
  });
}

async function initDatabase() {
  await createTables(client);
  await seedDatabase(client);
}

export async function getTradeDb() {
  if (!initPromise) {
    initPromise = initDatabase();
  }

  await initPromise;
  return client;
}
