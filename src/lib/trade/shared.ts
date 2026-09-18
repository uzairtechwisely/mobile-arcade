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

export const colourPalette: Record<DeviceCategory, Array<{ key: string; label: string; swatch: string }>> = {
  phone: [
    { key: "black", label: "Black", swatch: "#1D1D1F" },
    { key: "white", label: "White", swatch: "#F5F5F7" },
    { key: "silver", label: "Silver", swatch: "#C7C9CC" },
    { key: "gold", label: "Gold", swatch: "#E4C89C" },
    { key: "blue", label: "Blue", swatch: "#3385FD" },
    { key: "pink", label: "Pink", swatch: "#F1B8C4" },
    { key: "green", label: "Green", swatch: "#7FA98B" },
    { key: "purple", label: "Purple", swatch: "#8C7FB5" },
  ],
  tablet: [
    { key: "black", label: "Black", swatch: "#1D1D1F" },
    { key: "white", label: "White", swatch: "#F5F5F7" },
    { key: "silver", label: "Silver", swatch: "#C7C9CC" },
    { key: "gold", label: "Gold", swatch: "#E4C89C" },
    { key: "blue", label: "Blue", swatch: "#3385FD" },
  ],
  laptop: [
    { key: "space_grey", label: "Space Grey", swatch: "#6E6E73" },
    { key: "silver", label: "Silver", swatch: "#C7C9CC" },
    { key: "gold", label: "Gold", swatch: "#E4C89C" },
    { key: "black", label: "Black", swatch: "#1D1D1F" },
  ],
  gaming_device: [
    { key: "black", label: "Black", swatch: "#1D1D1F" },
    { key: "white", label: "White", swatch: "#F5F5F7" },
    { key: "blue", label: "Blue", swatch: "#3385FD" },
    { key: "red", label: "Red", swatch: "#D65B5B" },
  ],
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
