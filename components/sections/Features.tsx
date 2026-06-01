"use client";
import { motion } from "framer-motion";
import {
  Camera, Sparkles, BarChart3, Star, Volume2, ShoppingCart,
  Trophy, GitCompare, Map, ClipboardList, Bell, FileText,
  Search, Shield, Layers, Zap,
} from "lucide-react";

const FEATURES = [
  { icon: Camera,        title: "Snap & identify",       blurb: "Point. Tap. Know. Works on photos from any angle, any era — from a 1956 Mercedes 300SL to a 2025 Hyundai Ioniq 6." },
  { icon: Sparkles,      title: "Ask the AI",            blurb: "Built on Claude. Ask follow-up questions about any spotted car — engine, history, value, ownership." },
  { icon: BarChart3,     title: "Live market value",     blurb: "5-year price history charts. Rising, holding, or falling — know before you offer." },
  { icon: Star,          title: "Rarity score",          blurb: "A 1–10 grade based on production numbers, geography, and time. Spot a unicorn." },
  { icon: Volume2,       title: "Engine sounds",         blurb: "Tap to hear what it sounds like at idle, redline, downshift. Curated library, real recordings." },
  { icon: ShoppingCart,  title: "Listings checker",      blurb: "Cars.com, Bring a Trailer, Hemmings, Mobile.de — one tap to find that exact car for sale." },
  { icon: Trophy,        title: "Celebrity owners",      blurb: "Beckham's SF90. Drake's Pagani. Documented + sourced ownership history per spec." },
  { icon: GitCompare,    title: "Compare any two cars",  blurb: "0–60, horsepower, value, rarity, fuel economy — side by side, in five seconds." },
  { icon: Map,           title: "Spot map",              blurb: "See where rare cars get caught in the wild. Yours plotted privately, others anonymized." },
  { icon: ClipboardList, title: "History feed",          blurb: "Every car you've ever spotted, in one place. Filter by maker, era, rarity." },
  { icon: Bell,          title: "Auction alerts",        blurb: "Get pinged when that exact spec hits Bring a Trailer or RM Sotheby's." },
  { icon: FileText,      title: "Valuation reports",     blurb: "Concours tier: investment-grade PDF reports you can send to your insurer." },
  { icon: Search,        title: "VIN decoder",           blurb: "Concours tier: full factory build sheet from any VIN — options, color codes, plant." },
  { icon: Shield,        title: "Insurance estimate",    blurb: "Plug in your zip, get a ballpark from three carriers — no email required." },
  { icon: Layers,        title: "Trim & color variants", blurb: "Every option package, every paint code, every wheel design — properly catalogued." },
  { icon: Zap,           title: "Offline mode",          blurb: "Cached for the last 500 cars you spotted. Identify in airplane mode." },
];

export function Features() {
  return (
    <section id="features" className="bg-spotter-ink py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.24em] text-spotter-orange mb-3">Features</p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Everything about <span className="gradient-text">every car</span>.
          </h2>
          <p className="text-spotter-mute max-w-xl mx-auto">
            500,000+ vehicles indexed. Built for spotters, collectors, valuers, dealers, and the
            person who just wants to know what their neighbour's car is.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (i % 4) * 0.06 + Math.floor(i / 4) * 0.04, duration: 0.4 }}
                className="rounded-2xl border border-spotter-line bg-spotter-panel/40 p-5 hover:bg-spotter-panel/70 hover:border-spotter-line/80 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-spotter-orange/15 to-spotter-red/15 grid place-items-center mb-4 group-hover:from-spotter-orange/25 group-hover:to-spotter-red/25 transition-colors">
                  <Icon className="w-5 h-5 text-spotter-orange" />
                </div>
                <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-spotter-mute leading-relaxed">{f.blurb}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
