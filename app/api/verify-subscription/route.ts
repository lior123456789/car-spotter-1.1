import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_ENABLED, planFromPriceId } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Verifies a completed Stripe Checkout session and returns the active tier.
 * Client calls this after Stripe redirects them back with ?session_id=...
 * then writes the tier to their own Firestore /users/{uid} doc.
 *
 * Returns: { plan: "spotter"|"collector"|"concours", customerId, status }
 */
export async function GET(req: NextRequest) {
  if (!STRIPE_ENABLED || !stripe) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "missing_session_id" }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "line_items.data.price"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ status: session.status, plan: "free" });
    }

    const subscription = session.subscription;
    const priceId = typeof subscription === "object" && subscription
      ? (subscription as any).items?.data?.[0]?.price?.id
      : session.line_items?.data?.[0]?.price?.id;

    const plan = priceId ? planFromPriceId(priceId) : null;
    if (!plan) {
      return NextResponse.json({ error: "unknown_price", priceId }, { status: 500 });
    }

    return NextResponse.json({
      plan,
      status: session.status,
      customerId: typeof session.customer === "string" ? session.customer : null,
      userId: session.metadata?.userId ?? session.client_reference_id ?? null,
      subscriptionId: typeof subscription === "string" ? subscription : (subscription as any)?.id ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "stripe_error", message: err.message }, { status: 500 });
  }
}
