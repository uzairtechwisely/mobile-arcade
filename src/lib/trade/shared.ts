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
  { key: "cracked_working", label: "Cracked Working" },
  { key: "cracked_not_working", label: "Cracked Not Working" },
] as const;

export type DeviceCondition = (typeof deviceConditions)[number]["key"];

export const conditionLabels: Record<DeviceCondition, string> = {
  brand_new: "Brand New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  cracked_working: "Cracked Working",
  cracked_not_working: "Cracked Not Working",
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
  condition: DeviceCondition;
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
  postageService: string;
  postageTrackingReference: string | null;
  estimatedPostageCostGbp: number;
  postageReimbursementGbp: number;
  expectedPayoutOnReceiptGbp: number;
  reward: RewardSummary | null;
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
