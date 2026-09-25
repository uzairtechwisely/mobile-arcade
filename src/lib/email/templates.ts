const BLUE = "#006afc";
const PURPLE = "#3c2a68";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const gbp = (value: number) => `£${value.toLocaleString("en-GB")}`;

export function maskAccountNumber(value: string) {
  return value.length > 4 ? `****${value.slice(-4)}` : "****";
}

type Row = [label: string, value: string];

function layout(title: string, intro: string, rows: Row[], footer: string, accent = BLUE) {
  const rowHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;color:#6e6e73;font-size:14px;border-bottom:1px solid #e8e8ed">${escapeHtml(label)}</td>
          <td style="padding:10px 0;color:#1d1d1f;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #e8e8ed">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#f5f5f7;font-family:Inter,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#ffffff;border-radius:20px;overflow:hidden">
      <div style="background:${accent};padding:24px 28px;color:#ffffff;font-size:20px;font-weight:700">Mobile Arcade</div>
      <div style="padding:28px">
        <h1 style="margin:0 0 12px;font-size:22px;color:#1d1d1f">${escapeHtml(title)}</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:22px;color:#6e6e73">${intro}</p>
        <table style="width:100%;border-collapse:collapse">${rowHtml}</table>
        <p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#6e6e73">${footer}</p>
      </div>
    </div>
  </div>
</body></html>`;
}

function toText(title: string, intro: string, rows: Row[], footer: string) {
  return [title, "", intro.replace(/<[^>]+>/g, ""), "", ...rows.map(([l, v]) => `${l}: ${v}`), "", footer.replace(/<[^>]+>/g, "")].join("\n");
}

export type TradeEmailData = {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  address: string;
  device: string;
  storage: string | null;
  condition: string;
  cashOfferGbp: number;
  rewardLabel: string | null;
  expectedPayoutGbp: number;
  hasOwnPackaging: boolean;
  postagePackPaymentIntentId: string | null;
  bankAccountName: string;
  bankSortCode: string;
  bankAccountNumber: string;
};

export function customerTradeEmail(d: TradeEmailData) {
  const firstName = d.customerName.split(" ")[0];
  const rows: Row[] = [
    ["Reference", d.reference],
    ["Device", d.device],
    ...(d.storage ? ([["Storage", d.storage]] as Row[]) : []),
    ["Condition", d.condition],
    ["Sale price", `up to ${gbp(d.cashOfferGbp)}`],
    ...(d.rewardLabel ? ([["Bonus reward", d.rewardLabel]] as Row[]) : []),
    ["Expected payout on receipt", gbp(d.expectedPayoutGbp)],
  ];
  const next = d.hasOwnPackaging
    ? "Pack your device securely and our team will be in touch to arrange collection."
    : "Your protective postage pack is on its way - the £8 is added back to your payout once we receive your device.";
  const intro = `Hi ${escapeHtml(firstName)}, thanks for trading in with Mobile Arcade. ${escapeHtml(next)} Once your device passes inspection, we pay the bank account you provided.`;
  const footer =
    "We will never call you to ask for your bank card details, ask you to move funds into another account, or ask for any payment before we pay you. Reply to this email if anything looks wrong.";
  const subject = `Your Mobile Arcade trade-in ${d.reference}`;
  return {
    subject,
    html: layout("Your trade-in is confirmed", intro, rows, footer),
    text: toText("Your trade-in is confirmed", intro, rows, footer),
  };
}

export function businessTradeEmail(d: TradeEmailData) {
  const rows: Row[] = [
    ["Reference", d.reference],
    ["Customer", d.customerName],
    ["Email", d.customerEmail],
    ["Mobile", d.customerMobile],
    ["Address", d.address],
    ["Device", d.device],
    ...(d.storage ? ([["Storage", d.storage]] as Row[]) : []),
    ["Condition", d.condition],
    ["Sale price", gbp(d.cashOfferGbp)],
    ["Bonus reward", d.rewardLabel ?? "None"],
    ["Expected payout", gbp(d.expectedPayoutGbp)],
    ["Packaging", d.hasOwnPackaging ? "Customer has own packaging" : "Postage pack requested (paid)"],
    ...(d.postagePackPaymentIntentId ? ([["Stripe payment", d.postagePackPaymentIntentId]] as Row[]) : []),
    ["Bank account name", d.bankAccountName],
    ["Bank account", `${d.bankSortCode} / ${maskAccountNumber(d.bankAccountNumber)}`],
  ];
  const intro = "A new trade-in has been confirmed. Full details are stored in the database.";
  const footer = "Full bank details are only kept in the database, not in email.";
  return {
    subject: `New trade-in ${d.reference} - ${d.device}`,
    html: layout("New trade-in confirmed", intro, rows, footer, PURPLE),
    text: toText("New trade-in confirmed", intro, rows, footer),
  };
}

export type SupportEmailData = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  deviceCategory: string;
  modelQuery: string | null;
  storageOption?: string | null;
  requestedAmountGbp: number | null;
  condition: string | null;
  reason: string;
};

export function customerSupportEmail(d: SupportEmailData) {
  const intro = `Hi ${escapeHtml(d.customerName.split(" ")[0])}, we have your request and a member of the team will contact you shortly with an accurate quote.`;
  const rows: Row[] = [
    ["Request", d.id.slice(0, 8).toUpperCase()],
    ["Device", d.modelQuery || d.deviceCategory],
    ...(d.storageOption ? ([["Storage", d.storageOption]] as Row[]) : []),
  ];
  const footer = "You can reply to this email if you need to add anything.";
  return {
    subject: "We received your Mobile Arcade quote request",
    html: layout("We've got your request", intro, rows, footer),
    text: toText("We've got your request", intro, rows, footer),
  };
}

export function businessSupportEmail(d: SupportEmailData) {
  const rows: Row[] = [
    ["Request", d.id],
    ["Customer", d.customerName],
    ["Email", d.customerEmail],
    ["Mobile", d.customerMobile],
    ["Category", d.deviceCategory],
    ["Model searched", d.modelQuery || "-"],
    ["Storage", d.storageOption || "-"],
    ["Condition", d.condition || "-"],
    ["Requested amount", d.requestedAmountGbp ? gbp(d.requestedAmountGbp) : "-"],
    ["Reason", d.reason],
  ];
  const intro = "A customer submitted the quote/support form. It is also saved in the database.";
  return {
    subject: `Quote request from ${d.customerName}`,
    html: layout("New quote request", intro, rows, "", PURPLE),
    text: toText("New quote request", intro, rows, ""),
  };
}
