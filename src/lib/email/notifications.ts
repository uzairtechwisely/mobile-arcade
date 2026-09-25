import { getBusinessEmail, sendEmail } from "@/lib/email/send";
import {
  businessSupportEmail,
  businessTradeEmail,
  customerSupportEmail,
  customerTradeEmail,
  type SupportEmailData,
  type TradeEmailData,
} from "@/lib/email/templates";

/** Customer confirmation + business notification. The trade is already saved; email is best-effort. */
export async function notifyTradeConfirmed(data: TradeEmailData) {
  const customer = customerTradeEmail(data);
  const business = businessTradeEmail(data);
  const businessEmail = getBusinessEmail();

  await Promise.all([
    sendEmail({
      kind: "trade_confirmation_customer",
      to: data.customerEmail,
      reference: data.reference,
      replyTo: businessEmail ?? undefined,
      ...customer,
    }),
    businessEmail
      ? sendEmail({
          kind: "trade_notification_business",
          to: businessEmail,
          reference: data.reference,
          replyTo: data.customerEmail,
          ...business,
        })
      : Promise.resolve(false),
  ]);
}

export async function notifySupportRequest(data: SupportEmailData) {
  const customer = customerSupportEmail(data);
  const business = businessSupportEmail(data);
  const businessEmail = getBusinessEmail();

  await Promise.all([
    sendEmail({
      kind: "support_ack_customer",
      to: data.customerEmail,
      reference: data.id,
      replyTo: businessEmail ?? undefined,
      ...customer,
    }),
    businessEmail
      ? sendEmail({
          kind: "support_notification_business",
          to: businessEmail,
          reference: data.id,
          replyTo: data.customerEmail,
          ...business,
        })
      : Promise.resolve(false),
  ]);
}
