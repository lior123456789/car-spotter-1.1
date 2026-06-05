# Deploy to Vercel — 5 minutes

## 1. Import the repo

1. Go to **https://vercel.com/new**
2. Click **Import** next to `lior123456789/car-spotter-1.1`
3. Framework Preset: **Next.js** (auto-detected)
4. **Add the env vars** below (values are in the Vercel chat, never in git).

## 2. Env vars to paste

Vercel project → Settings → Environment Variables:

| Key | Where to get the value |
| --- | --- |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same Stripe page |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → existing endpoint → Reveal |
| `STRIPE_PRICE_SPOTTER_MONTHLY` | Stripe Products page |
| `STRIPE_PRICE_SPOTTER_YEARLY` | " |
| `STRIPE_PRICE_COLLECTOR_MONTHLY` | " |
| `STRIPE_PRICE_COLLECTOR_YEARLY` | " |
| `STRIPE_PRICE_CONCOURS_MONTHLY` | " |
| `STRIPE_PRICE_CONCOURS_YEARLY` | " |

Firebase web keys are hardcoded as fallbacks in `lib/firebase.ts` — no
need to set them in Vercel.

## 3. Move the domain

1. Vercel project → Settings → Domains → Add `carsspotter.com` + `www.carsspotter.com`
2. Update DNS at Namecheap:
   - `A   @   76.76.21.21`
   - `CNAME www cname.vercel-dns.com`
3. SSL provisions automatically (~5-10 min)

## 4. Webhook (no action needed)
The Stripe webhook already points to `https://carsspotter.com/api/webhook/stripe` —
it'll keep working once DNS flips to Vercel.

## 5. Delete Render
Once Vercel is verified live, delete the Render service.
