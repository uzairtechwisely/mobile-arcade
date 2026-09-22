"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getTradeDb } from "@/lib/trade/db";
import { computeQuoteOutcome, getSystemMaximumForCondition } from "@/lib/trade/pricing";
import {
  type DeviceCategory,
  type DeviceCondition,
  type QuoteFlowMode,
  type QuoteSummary,
  type RewardSummary,
  type TradeConfirmation,
  conditionLabels,
  POSTAGE_PACK_COST_GBP,
  REWARD_TIERS,
} from "@/lib/trade/shared";

const categoryValues = ["phone", "laptop", "tablet", "gaming_device"] as const;
const conditionValues = [
  "brand_new",
  "excellent",
  "good",
  "fair",
  "cracked_working",
  "cracked_not_working",
] as const;

const quoteInputSchema = z.object({
  category: z.enum(categoryValues),
  deviceModelId: z.string().min(1),
  condition: z.enum(conditionValues),
  storageOption: z.string().trim().max(40).optional(),
  colourOption: z.string().trim().max(40).optional(),
  requestedAmountGbp: z.coerce.number().int().positive().max(5000).optional(),
});

const rewardInputSchema = z.object({
  quoteId: z.string().min(1),
  action: z.enum(["play", "skip"]),
});

const confirmTradeSchema = z
  .object({
    quoteId: z.string().min(1),
    customerName: z.string().trim().min(2, "Please enter your full name."),
    customerEmail: z.email("Please enter a valid email address."),
    customerMobile: z
      .string()
      .trim()
      .min(10, "Please enter a valid mobile number.")
      .max(20, "Please enter a valid mobile number.")
      .regex(/^[0-9+\s()\-]+$/, "Please enter a valid mobile number."),
    collectionAddress: z.string().trim().min(10, "Please enter your full address."),
    bankAccountName: z.string().trim().min(2, "Please enter the account holder's name."),
    bankSortCode: z
      .string()
      .trim()
      .regex(/^\d{2}-?\d{2}-?\d{2}$/, "Please enter a valid UK sort code, e.g. 12-34-56."),
    bankAccountNumber: z
      .string()
      .trim()
      .regex(/^\d{6,8}$/, "Please enter a valid UK bank account number."),
    hasOwnPackaging: z.boolean(),
    postagePackStripePaymentIntentId: z.string().trim().min(1).optional(),
    termsAccepted: z.literal(true),
  })
  .refine(
    (data) => data.hasOwnPackaging || Boolean(data.postagePackStripePaymentIntentId),
    {
      message: "Postage pack payment is required before confirming.",
      path: ["postagePackStripePaymentIntentId"],
    },
  );

const supportRequestSchema = z.object({
  deviceCategory: z.enum(categoryValues),
  modelQuery: z.string().trim().max(120).optional().default(""),
  requestedAmountGbp: z.coerce.number().int().min(0).max(5000).optional(),
  condition: z.enum(conditionValues).optional(),
  customerName: z.string().trim().min(2),
  customerEmail: z.email(),
  customerMobile: z
    .string()
    .trim()
    .min(10)
    .max(20)
    .regex(/^[0-9+\s()\-]+$/),
  reason: z.enum(["typing_error", "unsupported_device", "system_down"]),
});

type DeviceModelRow = {
  id: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  imageUrl: string | null;
  pricing: {
    brand_new: number;
    excellent: number;
    good: number;
    fair: number;
    cracked_working: number;
    cracked_not_working: number;
  };
};

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return 0;
}

function rowToDeviceModel(row: Record<string, unknown>): DeviceModelRow {
  return {
    id: String(row.id),
    category: String(row.category) as DeviceCategory,
    brand: String(row.brand),
    model: String(row.model),
    imageUrl: row.image_url ? String(row.image_url) : null,
    pricing: {
      brand_new: toNumber(row.system_max_brand_new),
      excellent: toNumber(row.system_max_excellent),
      good: toNumber(row.system_max_good),
      fair: toNumber(row.system_max_fair),
      cracked_working: toNumber(row.system_max_cracked_working),
      cracked_not_working: toNumber(row.system_max_cracked_not_working),
    },
  };
}

async function getDeviceModelById(id: string) {
  const db = await getTradeDb();
  const result = await db.execute({
    sql: `
      SELECT
        id,
        category,
        brand,
        model,
        image_url,
        system_max_brand_new,
        system_max_excellent,
        system_max_good,
        system_max_fair,
        system_max_cracked_working,
        system_max_cracked_not_working
      FROM device_models
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  });

  const row = result.rows[0];
  return row ? rowToDeviceModel(row as Record<string, unknown>) : null;
}

function normalizeReward(row: Record<string, unknown>): RewardSummary | null {
  if (!row.reward_type || !row.reward_label) {
    return null;
  }

  return {
    type: String(row.reward_type),
    label: String(row.reward_label),
    valueGbp: toNumber(row.reward_value_gbp),
    isCash: Boolean(row.reward_is_cash),
  };
}

function quoteRowToSummary(row: Record<string, unknown>) {
  const offerStatus = String(row.offer_status) as QuoteSummary["offerStatus"];
  const flowMode =
    row.flow_mode && String(row.flow_mode).length > 0
      ? (String(row.flow_mode) as QuoteFlowMode)
      : offerStatus === "capped_to_system_maximum"
        ? "capped_offer_with_rescue_bonus"
        : "auto_accept_with_bonus";

  return {
    id: String(row.id),
    deviceModelId: String(row.device_model_id),
    category: String(row.device_category) as DeviceCategory,
    brand: String(row.brand),
    model: String(row.model),
    imageUrl: row.image_url ? String(row.image_url) : null,
    condition: String(row.device_condition) as DeviceCondition,
    storageOption: row.storage_option ? String(row.storage_option) : null,
    colourOption: row.colour_option ? String(row.colour_option) : null,
    requestedAmountGbp: toNumber(row.requested_amount_gbp),
    systemMaximumGbp: toNumber(row.system_maximum_gbp),
    cashOfferGbp: toNumber(row.cash_offer_gbp),
    offerStatus,
    flowMode,
    reward: normalizeReward(row),
  } satisfies QuoteSummary;
}

function pickReward(): RewardSummary {
  const totalWeight = REWARD_TIERS.reduce((sum, tier) => sum + tier.weight, 0);
  const roll = Math.random() * totalWeight;

  let cursor = 0;
  for (const tier of REWARD_TIERS) {
    cursor += tier.weight;
    if (roll < cursor) {
      return { type: tier.type, label: tier.label, valueGbp: tier.valueGbp, isCash: tier.isCash };
    }
  }

  const fallback = REWARD_TIERS[0];
  return { type: fallback.type, label: fallback.label, valueGbp: fallback.valueGbp, isCash: fallback.isCash };
}

function buildTradeReference() {
  return `MA-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

async function getQuoteById(quoteId: string) {
  const db = await getTradeDb();
  const result = await db.execute({
    sql: `
      SELECT
        q.id,
        q.device_model_id,
        q.device_category,
        q.device_condition,
        q.storage_option,
        q.colour_option,
        q.requested_amount_gbp,
        q.system_maximum_gbp,
        q.cash_offer_gbp,
        q.offer_status,
        q.flow_mode,
        q.reward_type,
        q.reward_label,
        q.reward_value_gbp,
        q.reward_is_cash,
        d.brand,
        d.model,
        d.image_url
      FROM quotes q
      INNER JOIN device_models d ON d.id = q.device_model_id
      WHERE q.id = ?
      LIMIT 1
    `,
    args: [quoteId],
  });

  const row = result.rows[0];
  return row ? quoteRowToSummary(row as Record<string, unknown>) : null;
}

export async function searchDeviceModels(
  category: DeviceCategory,
  query: string,
) {
  const db = await getTradeDb();
  const trimmed = query.trim().toLowerCase();
  const like = `%${trimmed}%`;

  const result = await db.execute({
    sql: `
      SELECT id, brand, model, category, image_url
      FROM device_models
      WHERE category = ?
        AND (? = '' OR search_text LIKE ?)
      ORDER BY brand ASC, model ASC
      LIMIT 50
    `,
    args: [category, trimmed, like],
  });

  return result.rows.map((row) => ({
    id: String(row.id),
    brand: String(row.brand),
    model: String(row.model),
    category: String(row.category) as DeviceCategory,
    label: `${String(row.brand)} ${String(row.model)}`,
    imageUrl: row.image_url ? String(row.image_url) : null,
  }));
}

export async function createQuote(input: unknown) {
  const parsed = quoteInputSchema.parse(input);
  const model = await getDeviceModelById(parsed.deviceModelId);

  if (!model || model.category !== parsed.category) {
    throw new Error("Selected model was not found for this category.");
  }

  // "I am not sure" (no requestedAmountGbp) is treated as asking for our best price,
  // which always resolves to the system maximum for this exact model + condition.
  const systemMaximumGbp = getSystemMaximumForCondition(model.pricing, parsed.condition);
  const effectiveRequestedAmountGbp = parsed.requestedAmountGbp ?? systemMaximumGbp;

  const quoteOutcome = computeQuoteOutcome(
    effectiveRequestedAmountGbp,
    model.pricing,
    parsed.condition,
  );

  const quoteId = randomUUID();
  const db = await getTradeDb();

  await db.execute({
    sql: `
      INSERT INTO quotes (
        id,
        device_model_id,
        device_category,
        device_condition,
        storage_option,
        colour_option,
        requested_amount_gbp,
        system_maximum_gbp,
        cash_offer_gbp,
        offer_status,
        flow_mode,
        reward_type,
        reward_label,
        reward_value_gbp,
        reward_is_cash,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      quoteId,
      model.id,
      parsed.category,
      parsed.condition,
      parsed.storageOption ?? null,
      parsed.colourOption ?? null,
      effectiveRequestedAmountGbp,
      quoteOutcome.systemMaximumGbp,
      quoteOutcome.cashOfferGbp,
      quoteOutcome.offerStatus,
      quoteOutcome.flowMode,
      null,
      null,
      null,
      0,
      new Date().toISOString(),
    ],
  });

  return {
    id: quoteId,
    deviceModelId: model.id,
    category: model.category,
    brand: model.brand,
    model: model.model,
    imageUrl: model.imageUrl,
    condition: parsed.condition,
    storageOption: parsed.storageOption ?? null,
    colourOption: parsed.colourOption ?? null,
    requestedAmountGbp: effectiveRequestedAmountGbp,
    systemMaximumGbp: quoteOutcome.systemMaximumGbp,
    cashOfferGbp: quoteOutcome.cashOfferGbp,
    offerStatus: quoteOutcome.offerStatus,
    flowMode: quoteOutcome.flowMode,
    reward: null,
    conditionLabel: conditionLabels[parsed.condition],
  } satisfies QuoteSummary & { conditionLabel: string };
}

export async function resolveReward(input: unknown) {
  const parsed = rewardInputSchema.parse(input);
  const quote = await getQuoteById(parsed.quoteId);

  if (!quote) {
    throw new Error("Quote not found.");
  }

  if (quote.reward) {
    return quote;
  }

  const reward =
    parsed.action === "skip"
      ? {
          type: "none",
          label: "No extra reward selected",
          valueGbp: 0,
          isCash: false,
        }
      : pickReward();

  const db = await getTradeDb();
  await db.execute({
    sql: `
      UPDATE quotes
      SET reward_type = ?, reward_label = ?, reward_value_gbp = ?, reward_is_cash = ?
      WHERE id = ?
    `,
    args: [
      reward.type,
      reward.label,
      reward.valueGbp,
      reward.isCash ? 1 : 0,
      parsed.quoteId,
    ],
  });

  return {
    ...quote,
    reward,
  } satisfies QuoteSummary;
}

export async function confirmTrade(input: unknown) {
  const parsed = confirmTradeSchema.parse(input);
  const quote = await getQuoteById(parsed.quoteId);

  if (!quote) {
    throw new Error("Quote not found.");
  }

  if (!quote.reward) {
    throw new Error("Please complete or skip the bonus game before checkout.");
  }

  const db = await getTradeDb();
  const existingTrade = await db.execute({
    sql: `
      SELECT
        id,
        quote_id,
        trade_reference_id,
        has_own_packaging,
        postage_service,
        postage_tracking_reference,
        postage_reimbursement_gbp
      FROM trades
      WHERE quote_id = ?
      LIMIT 1
    `,
    args: [parsed.quoteId],
  });

  const existingRow = existingTrade.rows[0];
  if (existingRow) {
    return {
      id: String(existingRow.id),
      quoteId: String(existingRow.quote_id),
      tradeReferenceId: String(existingRow.trade_reference_id),
      hasOwnPackaging: Boolean(existingRow.has_own_packaging),
      postageService: String(existingRow.postage_service),
      postageTrackingReference: existingRow.postage_tracking_reference
        ? String(existingRow.postage_tracking_reference)
        : null,
      estimatedPostageCostGbp: toNumber(existingRow.postage_reimbursement_gbp),
      postageReimbursementGbp: toNumber(existingRow.postage_reimbursement_gbp),
      expectedPayoutOnReceiptGbp:
        quote.cashOfferGbp +
        (quote.reward?.isCash ? quote.reward.valueGbp : 0) +
        toNumber(existingRow.postage_reimbursement_gbp),
      reward: quote.reward,
    } satisfies TradeConfirmation;
  }

  const reimbursement = parsed.hasOwnPackaging ? 0 : POSTAGE_PACK_COST_GBP;
  const postageService = parsed.hasOwnPackaging
    ? "Self-packaged collection"
    : "Mobile Arcade Postage Pack";
  const tradeId = randomUUID();
  const tradeReferenceId = buildTradeReference();

  await db.execute({
    sql: `
      INSERT INTO trades (
        id,
        quote_id,
        trade_reference_id,
        customer_name,
        customer_email,
        customer_mobile,
        collection_address,
        bank_account_name,
        bank_sort_code,
        bank_account_number,
        postage_service,
        postage_tracking_reference,
        estimated_postage_cost_gbp,
        postage_reimbursement_gbp,
        terms_accepted,
        has_own_packaging,
        postage_pack_purchased,
        postage_pack_stripe_payment_intent_id,
        postage_pack_shipping_address,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      tradeId,
      parsed.quoteId,
      tradeReferenceId,
      parsed.customerName,
      parsed.customerEmail,
      parsed.customerMobile,
      parsed.collectionAddress,
      parsed.bankAccountName,
      parsed.bankSortCode.replaceAll("-", ""),
      parsed.bankAccountNumber,
      postageService,
      null,
      reimbursement,
      reimbursement,
      1,
      parsed.hasOwnPackaging ? 1 : 0,
      parsed.hasOwnPackaging ? 0 : 1,
      parsed.postagePackStripePaymentIntentId ?? null,
      parsed.hasOwnPackaging ? null : parsed.collectionAddress,
      new Date().toISOString(),
    ],
  });

  return {
    id: tradeId,
    quoteId: parsed.quoteId,
    tradeReferenceId,
    hasOwnPackaging: parsed.hasOwnPackaging,
    postageService,
    postageTrackingReference: null,
    estimatedPostageCostGbp: reimbursement,
    postageReimbursementGbp: reimbursement,
    expectedPayoutOnReceiptGbp:
      quote.cashOfferGbp +
      (quote.reward?.isCash ? quote.reward.valueGbp : 0) +
      reimbursement,
    reward: quote.reward,
  } satisfies TradeConfirmation;
}

export async function createSupportRequest(input: unknown) {
  const parsed = supportRequestSchema.parse(input);
  const db = await getTradeDb();
  const id = randomUUID();

  await db.execute({
    sql: `
      INSERT INTO support_requests (
        id,
        device_category,
        model_query,
        requested_amount_gbp,
        device_condition,
        customer_name,
        customer_email,
        customer_mobile,
        reason,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      parsed.deviceCategory,
      parsed.modelQuery || null,
      parsed.requestedAmountGbp ?? null,
      parsed.condition ?? null,
      parsed.customerName,
      parsed.customerEmail,
      parsed.customerMobile,
      parsed.reason,
      new Date().toISOString(),
    ],
  });

  return {
    id,
    reason: parsed.reason,
  };
}
