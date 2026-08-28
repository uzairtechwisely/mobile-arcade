import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { getDeviceCatalogSource } from "@/lib/trade/catalog-source";

const localDatabasePath = path.join(process.cwd(), ".data", "mobile-arcade.db");
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
  await db.execute(`
    CREATE TABLE IF NOT EXISTS device_models (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      search_text TEXT NOT NULL,
      system_max_brand_new INTEGER NOT NULL,
      system_max_excellent INTEGER NOT NULL,
      system_max_good INTEGER NOT NULL,
      system_max_fair INTEGER NOT NULL,
      system_max_cracked_working INTEGER NOT NULL,
      system_max_cracked_not_working INTEGER NOT NULL,
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
      FOREIGN KEY (device_model_id) REFERENCES device_models(id)
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

  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_device_models_category ON device_models(category)",
  );
  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_device_models_search ON device_models(search_text)",
  );

  try {
    await db.execute(
      "ALTER TABLE quotes ADD COLUMN flow_mode TEXT NOT NULL DEFAULT 'auto_accept_with_bonus'",
    );
  } catch {
    // Column already exists in previously initialized databases.
  }
}

async function seedDatabase(db: Client) {
  for (const item of getDeviceCatalogSource()) {
    await db.execute({
      sql: `
        INSERT OR REPLACE INTO device_models (
          id,
          category,
          brand,
          model,
          search_text,
          system_max_brand_new,
          system_max_excellent,
          system_max_good,
          system_max_fair,
          system_max_cracked_working,
          system_max_cracked_not_working,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        item.id,
        item.category,
        item.brand,
        item.model,
        `${item.brand} ${item.model}`.toLowerCase(),
        item.systemMaxBrandNew,
        item.systemMaxExcellent,
        item.systemMaxGood,
        item.systemMaxFair,
        item.systemMaxCrackedWorking,
        item.systemMaxCrackedNotWorking,
        new Date().toISOString(),
      ],
    });
  }
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
