import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_ENABLED, priceIdFor, type Tier, type Billing } from "@/lib/stripe";
import { getOrCreateUserId } from "@/lib/userId";
import { getUser, updateUser } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Body = { tier?: Tier; billing?: Billing };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { tier, billing } = body;
  if (!tier || !billing) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  if (!STRIPE_ENABLED || !stripe) {
    // No keys → tell the client how to handle it (fall back to mailto on the FE)
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        message:
          "Stripe keys are not set. Set STRIPE_SECRET_KEY + STRIPE_PRICE_* env vars in Vercel to enable real checkout.",
      },
      { status: 503 },
    );
  }

  const priceId = priceIdFor(tier, billing);
  if (!priceId) {
    return NextResponse.json(
      { error: "missing_price_id", message: `STRIPE_PRICE_${tier.toUpperCase()}_${billing.toUpperCase()} env var is not set.` },
      { status: 500 },
    );
  }

  const userId = getOrCreateUserId();
  const user = await getUser(userId);

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#pricing`,
    customer: user.stripeCustomerId,
    client_reference_id: userId,
    metadata: { userId, tier, billing },
    subscription_data: { metadata: { userId, tier, billing } },
    allow_promotion_codes: true,
  });

  // Persist whichever customer ID Stripe created (if new) on the next webhook;
  // for now just respond with the URL.
  if (session.customer && typeof session.customer === "string" && !user.stripeCustomerId) {
    user.stripeCustomerId = session.customer;
    await updateUser(user);
  }

  return NextResponse.json({ url: session.url });
}
