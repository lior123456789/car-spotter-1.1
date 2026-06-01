# CarSpotter — landing page

Marketing site for **carsspotter.app**. Goal: $30k MRR.

Built on Next.js 14 (App Router) + Tailwind CSS 3 + framer-motion + tsparticles.
shadcn-style components in `/components/ui/`.

## Local

```bash
cd carsspotter-landing
npm install
npm run dev
# → http://localhost:3000
```

## Pricing math (for $30k MRR)

|         tier | price/mo | price/yr | target subs | MRR contribution |
| ------------ | -------- | -------- | ----------- | ---------------- |
| **Spotter**  | $6.99    | $59      | 2,000       | $13,980          |
| **Collector** *(popular)* | $14.99 | $129 | 1,000   | $14,990          |
| **Concours** | $29.99   | $249     |    50       | $1,500           |
|              |          |          | **3,050**   | **$30,470**      |

To hit $30k MRR you need roughly **3,000 paid subs** with this distribution. Tweak in
`components/sections/Pricing.tsx` → `TIERS`.

## Deploy

### Option A — Vercel (recommended, free)

1. Push to GitHub.
2. https://vercel.com/new → Import this repo → Deploy.
3. Add your custom domain (e.g. `landing.carsspotter.app`) under Project → Domains.

### Option B — Render (matches your other projects)

1. https://dashboard.render.com/ → New + → Web Service.
2. Pick this repo.
3. Build: `npm install && npm run build`. Start: `npm start`.
