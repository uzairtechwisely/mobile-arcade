import { ZodError } from "zod";

// Turns a thrown validation/service error into a short, human-readable
// message safe to show a customer — never Zod's raw JSON issue dump.
export function formatServiceError(error: unknown, fallback: string): string {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return first?.message && first.message !== "Invalid input" ? first.message : fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export const deviceCategories = [
  { key: "phone", label: "Phone" },
  { key: "laptop", label: "Laptop" },
  { key: "tablet", label: "Tablet" },
  { key: "gaming_device", label: "Gaming Device" },
] as const;

export type DeviceCategory = (typeof deviceCategories)[number]["key"];

export const deviceConditions = [
  { key: "brand_new", label: "Brand New" },
  { key: "excellent", label: "Excellent" },
  { key: "good", label: "Good" },
  { key: "fair", label: "Fair" },
  { key: "cracked_working", label: "Cracked but working" },
  { key: "cracked_not_working", label: "Cracked and not working" },
] as const;

// Conditions offered in the UI; the "Damaged" tile maps to the lowest tier so
// quotes stay conservative until the device is inspected.
export const selectableConditions = [
  { key: "brand_new", label: "Brand New" },
  { key: "excellent", label: "Excellent" },
  { key: "good", label: "Good" },
  { key: "cracked_not_working", label: "Damaged" },
] as const;

export type DeviceCondition = (typeof deviceConditions)[number]["key"];

export const conditionLabels: Record<DeviceCondition, string> = {
  brand_new: "Brand New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  cracked_working: "Damaged",
  cracked_not_working: "Damaged",
};

export type RewardSummary = {
  type: string;
  label: string;
  valueGbp: number;
  isCash: boolean;
};

export type QuoteFlowMode =
  | "auto_accept_with_bonus"
  | "capped_offer_with_rescue_bonus";

export type QuoteSummary = {
  id: string;
  deviceModelId: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  imageUrl: string | null;
  condition: DeviceCondition;
  storageOption: string | null;
  colourOption: string | null;
  requestedAmountGbp: number;
  systemMaximumGbp: number;
  cashOfferGbp: number;
  offerStatus: "matched_requested_amount" | "capped_to_system_maximum";
  flowMode: QuoteFlowMode;
  reward: RewardSummary | null;
};

export type TradeConfirmation = {
  id: string;
  quoteId: string;
  tradeReferenceId: string;
  hasOwnPackaging: boolean;
  postageService: string;
  postageTrackingReference: string | null;
  estimatedPostageCostGbp: number;
  postageReimbursementGbp: number;
  expectedPayoutOnReceiptGbp: number;
  reward: RewardSummary | null;
};

export const POSTAGE_PACK_COST_GBP = 8;

// Wedge order matches the spin-wheel UI in LandingPage.tsx, which reads REWARD_TIERS
// to lay out and animate to the server-chosen winning segment.
export const REWARD_TIERS = [
  { type: "cash_bonus", label: "£5 cash bonus", valueGbp: 5, isCash: true, weight: 35 },
  { type: "cash_bonus", label: "£10 cash bonus", valueGbp: 10, isCash: true, weight: 25 },
  {
    type: "ma_voucher",
    label: "£15 Mobile Arcade voucher",
    valueGbp: 15,
    isCash: false,
    weight: 15,
  },
  { type: "cash_bonus", label: "£20 cash bonus", valueGbp: 20, isCash: true, weight: 12 },
  { type: "cash_bonus", label: "£50 cash bonus", valueGbp: 50, isCash: true, weight: 8 },
  {
    type: "mystery_bag",
    label: "Mystery bag (up to £600 value)",
    valueGbp: 0,
    isCash: false,
    weight: 5,
  },
] as const satisfies ReadonlyArray<RewardSummary & { weight: number }>;

export const storageOptionsByCategory: Record<DeviceCategory, string[]> = {
  phone: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  tablet: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  laptop: ["128GB", "256GB", "512GB", "1TB", "2TB"],
  gaming_device: ["512GB", "825GB", "1TB", "2TB"],
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCategoryLabel(category: DeviceCategory) {
  return deviceCategories.find((item) => item.key === category)?.label ?? category;
}
