import { describe, expect, it } from "vitest";
import { computeQuoteOutcome } from "@/lib/trade/pricing";

const pricing = {
  brand_new: 520,
  excellent: 470,
  good: 430,
  fair: 380,
  cracked_working: 260,
  cracked_not_working: 150,
} as const;

describe("computeQuoteOutcome", () => {
  it("accepts the requested amount when it is below the system maximum", () => {
    const result = computeQuoteOutcome(300, pricing, "good");

    expect(result.systemMaximumGbp).toBe(430);
    expect(result.cashOfferGbp).toBe(300);
    expect(result.offerStatus).toBe("matched_requested_amount");
    expect(result.flowMode).toBe("auto_accept_with_bonus");
  });

  it("caps the offer at the system maximum when the request is too high", () => {
    const result = computeQuoteOutcome(500, pricing, "good");

    expect(result.systemMaximumGbp).toBe(430);
    expect(result.cashOfferGbp).toBe(430);
    expect(result.offerStatus).toBe("capped_to_system_maximum");
    expect(result.flowMode).toBe("capped_offer_with_rescue_bonus");
  });
});
