import Stripe from "stripe";

export const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;

export const stripe = STRIPE_ENABLED
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion })
  : null;

export type Tier = "spotter" | "collector" | "concours";
export type Billing = "monthly" | "yearly";

// Map tier+billing → Stripe Price ID. Set these in Vercel env after
// creating the products+prices in your Stripe dashboard.
export function priceIdFor(tier: Tier, billing: Billing): string | null {
  const key = `STRIPE_PRICE_${tier.toUpperCase()}_${billing.toUpperCase()}`;
  return process.env[key] ?? null;
}

export function planFromPriceId(priceId: string): Tier | null {
  for (const tier of ["spotter", "collector", "concours"] as const) {
    for (const billing of ["monthly", "yearly"] as const) {
      if (priceIdFor(tier, billing) === priceId) return tier;
    }
  }
  return null;
}
