import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_ENABLED, planFromPriceId } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Recover a paid subscription that didn't propagate to Firestore
 * (e.g. because the Stripe webhook was misconfigured at the time of
 * purchase). Client passes the signed-in user's email. We query Stripe
 * for an active subscription on that email and return the active tier.
 * Client then writes it to their /users/{uid}.plan doc — they're
 * already authenticated, so RLS lets the write through.
 */
export async function GET(req: NextRequest) {
  if (!STRIPE_ENABLED || !stripe) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }

  try {
    // 1. Find Stripe customers with this email
    const customers = await stripe.customers.list({ email, limit: 5 });
    if (customers.data.length === 0) {
      return NextResponse.json({ plan: "free", reason: "no_customer_found", email });
    }

    // 2. For each customer, look for an active subscription
    let bestPlan: "free" | "spotter" | "collector" | "concours" = "free";
    let activeSub: string | null = null;
    let customerId: string | null = null;

    for (const c of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: c.id, status: "active", limit: 5 });
      for (const s of subs.data) {
        const priceId = s.items.data[0]?.price?.id;
        if (!priceId) continue;
        const tier = planFromPriceId(priceId);
        if (!tier) continue;
        // Pick the highest tier across all active subs
        const rank = { free: 0, spotter: 1, collector: 2, concours: 3 } as const;
        if (rank[tier] > rank[bestPlan]) {
          bestPlan = tier;
          activeSub = s.id;
          customerId = c.id;
        }
      }
    }

    return NextResponse.json({
      plan: bestPlan,
      stripeCustomerId: customerId,
      subscriptionId: activeSub,
      email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "stripe_lookup_failed", message: err.message }, { status: 500 });
  }
}
