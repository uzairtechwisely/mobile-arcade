import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getTradeDb } from "@/lib/trade/db";

// Stripe posts payment events here. We keep our own copy in stripe_events so
// payments can be reconciled against trades even if a customer closes the tab.
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !secret || !signature) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 501 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const db = await getTradeDb();
    await db.execute({
      sql: `INSERT OR IGNORE INTO stripe_events
              (id, type, quote_id, payment_intent_id, amount_total, currency, payment_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        event.id,
        event.type,
        session.metadata?.quoteId ?? null,
        typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
        session.amount_total ?? null,
        session.currency ?? null,
        session.payment_status,
        new Date().toISOString(),
      ],
    });
  }

  return NextResponse.json({ received: true });
}
