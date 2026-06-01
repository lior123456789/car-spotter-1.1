# Deploy in 2 minutes

## Step 1 — push to GitHub (60 s)

1. Open https://github.com/new
2. Repository name: **`carsspotter-landing`**
3. Pick **Public** (Vercel free tier works on public repos)
4. **Don't** tick "Add a README". Click **Create repository**.
5. On the next page GitHub shows you a shell snippet — ignore it, run this in Terminal:

```bash
cd ~/Desktop/claude/carsspotter-landing
git remote add origin https://github.com/lior123456789/carsspotter-landing.git
git branch -M main
git push -u origin main
```

## Step 2 — deploy on Vercel (60 s)

1. Open https://vercel.com/new
2. **Import Git Repository** → pick **`carsspotter-landing`**
3. Framework Preset: **Next.js** (auto-detected)
4. Click **Deploy**. Wait ~90 s.
5. Vercel gives you a URL like `carsspotter-landing.vercel.app` — that's your live landing.

## Step 3 — custom domain (optional)

You already own `carsspotter.app`. You probably want the landing on `www.carsspotter.app` or `landing.carsspotter.app` and keep the app itself on the root.

1. In Vercel project → **Settings → Domains**.
2. Add `landing.carsspotter.app`.
3. Vercel shows you a CNAME record — paste it into your domain registrar (probably Namecheap / Cloudflare).
4. Done in ~5 min once DNS propagates.

## Pricing math (in case anyone asks)

|             | price/mo | yearly | target subs | MRR              |
| ----------- | -------- | ------ | ----------- | ---------------- |
| Spotter     | $6.99    | $59    | 2,000       | $13,980          |
| Collector ⭐| $14.99   | $129   | 1,000       | $14,990          |
| Concours    | $29.99   | $249   | 50          | $1,500           |
| **Total**   |          |        | **3,050**   | **$30,470**      |

Adjust in `components/sections/Pricing.tsx` → `TIERS`.
