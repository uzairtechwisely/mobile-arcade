import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { POSTAGE_PACK_COST_GBP, formatServiceError } from "@/lib/trade/shared";

const bodySchema = z.object({
  quoteId: z.string().min(1),
  deviceLabel: z.string().trim().min(1),
  returnUrl: z.string().url(),
});

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          "Postage pack payments are not configured yet. Please contact Mobile Arcade to arrange a pack.",
      },
      { status: 501 },
    );
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: POSTAGE_PACK_COST_GBP * 100,
            product_data: {
              name: "Mobile Arcade Postage Pack",
              description: `Protective postage pack for ${parsed.deviceLabel}. Refunded when your trade-in is received.`,
            },
          },
        },
      ],
      metadata: { quoteId: parsed.quoteId },
      success_url: `${parsed.returnUrl}?postage_pack=success&session_id={CHECKOUT_SESSION_ID}&quoteId=${encodeURIComponent(parsed.quoteId)}`,
      cancel_url: `${parsed.returnUrl}?postage_pack=cancelled`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    const message = formatServiceError(error, "Unable to start postage pack payment.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!secretKey || !sessionId) {
    return NextResponse.json({ error: "Missing session." }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      paid: session.payment_status === "paid",
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify payment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
