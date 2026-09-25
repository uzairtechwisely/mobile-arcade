import { randomUUID } from "node:crypto";
import { getTradeDb } from "@/lib/trade/db";

export type EmailKind =
  | "trade_confirmation_customer"
  | "trade_notification_business"
  | "support_ack_customer"
  | "support_notification_business";

type SendInput = {
  kind: EmailKind;
  to: string;
  subject: string;
  html: string;
  text: string;
  reference?: string;
  replyTo?: string;
};

export function getBusinessEmail() {
  return process.env.BUSINESS_EMAIL?.trim() || null;
}

async function logEmail(input: SendInput, status: "sent" | "failed" | "skipped", error?: string) {
  try {
    const db = await getTradeDb();
    await db.execute({
      sql: `INSERT INTO email_log (id, kind, recipient, subject, reference, status, error, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        input.kind,
        input.to,
        input.subject,
        input.reference ?? null,
        status,
        error ?? null,
        new Date().toISOString(),
      ],
    });
  } catch (logError) {
    console.error("[email] could not write email_log", logError);
  }
}

/**
 * Sends through the SendGrid v3 API. Never throws: an email problem must not
 * break a customer's trade-in, so failures are recorded in email_log instead.
 */
export async function sendEmail(input: SendInput): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.warn(`[email] SENDGRID_API_KEY / EMAIL_FROM not set - skipped "${input.subject}" to ${input.to}`);
    await logEmail(input, "skipped", "Email provider not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: input.to }] }],
        from: { email: from, name: process.env.EMAIL_FROM_NAME?.trim() || "Mobile Arcade" },
        ...(input.replyTo ? { reply_to: { email: input.replyTo } } : {}),
        subject: input.subject,
        content: [
          { type: "text/plain", value: input.text },
          { type: "text/html", value: input.html },
        ],
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      await logEmail(input, "failed", `SendGrid ${response.status}: ${detail}`);
      return false;
    }

    await logEmail(input, "sent");
    return true;
  } catch (error) {
    await logEmail(input, "failed", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}
