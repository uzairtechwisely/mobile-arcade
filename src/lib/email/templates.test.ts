import { describe, expect, it } from "vitest";
import { businessTradeEmail, customerTradeEmail, escapeHtml, maskAccountNumber, type TradeEmailData } from "./templates";

const data: TradeEmailData = {
  reference: "MA-2026-ABC123",
  customerName: "Ada <script>alert(1)</script> Lovelace",
  customerEmail: "ada@example.com",
  customerMobile: "07123456789",
  address: "1 Test Street, London",
  device: "Apple iPhone 13",
  storage: "128GB",
  condition: "Good",
  cashOfferGbp: 280,
  rewardLabel: "£5 cash bonus",
  expectedPayoutGbp: 285,
  hasOwnPackaging: true,
  postagePackPaymentIntentId: null,
  bankAccountName: "Ada Lovelace",
  bankSortCode: "123456",
  bankAccountNumber: "98765432",
};

describe("email templates", () => {
  it("escapes HTML in customer-supplied values", () => {
    expect(escapeHtml("<b>&\"'")).toBe("&lt;b&gt;&amp;&quot;&#39;");
    expect(businessTradeEmail(data).html).not.toContain("<script>");
  });

  it("never leaks the full account number", () => {
    expect(maskAccountNumber("98765432")).toBe("****5432");
    expect(businessTradeEmail(data).html).not.toContain("98765432");
    expect(customerTradeEmail(data).html).not.toContain("98765432");
  });

  it("includes the reference in the customer subject", () => {
    expect(customerTradeEmail(data).subject).toContain("MA-2026-ABC123");
  });
});
