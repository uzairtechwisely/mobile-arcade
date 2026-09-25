import type { QuoteFlowMode } from "@/lib/trade/shared";

export type ComputedQuote = {
  systemMaximumGbp: number;
  cashOfferGbp: number;
  offerStatus: "matched_requested_amount" | "capped_to_system_maximum";
  flowMode: QuoteFlowMode;
};

// systemMaximumGbp is the catalog price for the exact model + storage + condition.
export function computeQuoteOutcome(
  requestedAmountGbp: number,
  systemMaximumGbp: number,
): ComputedQuote {
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
