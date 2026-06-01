import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_ENABLED, planFromPriceId } from "@/lib/stripe";
import { getUser, updateUser } from "@/lib/storage";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!STRIPE_ENABLED || !stripe) {
    return NextResponse.json({ ok: false, reason: "stripe_disabled" }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, reason: "no_webhook_secret" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false, reason: "no_sig" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ ok: false, reason: "bad_sig" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.client_reference_id ?? session.metadata?.userId) as string | undefined;
        if (!userId) break;
        const user = await getUser(userId);
        user.stripeCustomerId = (session.customer as string) ?? user.stripeCustomerId;
        const tierMeta = session.metadata?.tier as "spotter" | "collector" | "concours" | undefined;
        if (tierMeta) user.plan = tierMeta;
        await updateUser(user);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.userId) as string | undefined;
        if (!userId) break;
        const user = await getUser(userId);
        const priceId = sub.items.data[0]?.price?.id;
        const tier = priceId ? planFromPriceId(priceId) : null;
        if (tier) user.plan = tier;
        await updateUser(user);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata?.userId) as string | undefined;
        if (!userId) break;
        const user = await getUser(userId);
        user.plan = "free";
        await updateUser(user);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
