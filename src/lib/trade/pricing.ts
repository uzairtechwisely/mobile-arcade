import type { DeviceCondition, QuoteFlowMode } from "@/lib/trade/shared";

export type DevicePricingMatrix = {
  brand_new: number;
  excellent: number;
  good: number;
  fair: number;
  cracked_working: number;
  cracked_not_working: number;
};

export type ComputedQuote = {
  systemMaximumGbp: number;
  cashOfferGbp: number;
  offerStatus: "matched_requested_amount" | "capped_to_system_maximum";
  flowMode: QuoteFlowMode;
};

export function getSystemMaximumForCondition(
  pricing: DevicePricingMatrix,
  condition: DeviceCondition,
) {
  return pricing[condition];
}

export function computeQuoteOutcome(
  requestedAmountGbp: number,
  pricing: DevicePricingMatrix,
  condition: DeviceCondition,
): ComputedQuote {
  const systemMaximumGbp = getSystemMaximumForCondition(pricing, condition);
  const isAboveSystemMaximum = requestedAmountGbp > systemMaximumGbp;

  return {
    systemMaximumGbp,
    cashOfferGbp: isAboveSystemMaximum ? systemMaximumGbp : requestedAmountGbp,
    offerStatus: isAboveSystemMaximum
      ? "capped_to_system_maximum"
      : "matched_requested_amount",
    flowMode: isAboveSystemMaximum
      ? "capped_offer_with_rescue_bonus"
      : "auto_accept_with_bonus",
  };
}
