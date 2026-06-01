"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Trophy, Camera } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    id: "free",
    name: "Free",
    icon: Camera,
    tagline: "Try it before you buy it",
    monthly: 0,
    yearly: 0,
    cta: "Get 3 free scans",
    accent: "from-zinc-700 to-zinc-900",
    features: [
      "3 free car identifications",
      "Make, model & year",
      "Original MSRP",
      "Basic rarity score",
      "Save spots to History",
      "Upgrade anytime — no card needed",
    ],
  },
  {
    id: "spotter",
    name: "Spotter",
    icon: Sparkles,
    tagline: "For the weekend car-spotter",
    monthly: 6.99,
    yearly: 59,
    cta: "Go Spotter",
    accent: "from-zinc-700 to-zinc-900",
    features: [
      "50 identifications per day",
      "Full spec sheet (engine, hp, 0-60)",
      "Original MSRP + market value range",
      "Rarity score with explanation",
      "Save unlimited spots to History",
      "Fun fact for every car",
    ],
  },
  {
    id: "collector",
    name: "Collector",
    icon: Crown,
    tagline: "Most popular · For the serious enthusiast",
    monthly: 14.99,
    yearly: 129,
    cta: "Go Collector",
    accent: "from-spotter-orange to-spotter-red",
    popular: true,
    features: [
      "Unlimited car identifications",
      "Ask the AI (powered by Claude)",
      "Engine sound playback library",
      "Celebrity owners + ownership history",
      "Live market value charts (5-year)",
      "Listings checker — find for sale near you",
      "Compare any two cars side by side",
      "Map of where cars get spotted",
    ],
  },
  {
    id: "concours",
    name: "Concours",
    icon: Trophy,
    tagline: "For collectors, dealers, valets, valuers",
    monthly: 29.99,
    yearly: 249,
    cta: "Get Concours",
    accent: "from-amber-600 to-amber-800",
    features: [
      "Everything in Collector",
      "VIN decoder (build sheet + factory options)",
      "Auction price alerts (Bring a Trailer, RM Sotheby's)",
      "Investment-grade valuation report (PDF export)",
      "License plate lookup (where allowed)",
      "Insurance estimate engine",
      "Priority AI — faster Claude responses",
      "Concierge support",
    ],
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="relative bg-spotter-ink py-24 md:py-32 px-4 overflow-hidden">
      {/* subtle aurora orbs */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[120%] h-[800px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(255,122,46,0.35), transparent)" }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.24em] text-spotter-orange mb-3">Pricing</p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Pick your <span className="gradient-text">badge</span>.
          </h2>
          <p className="text-spotter-mute max-w-xl mx-auto">
            Free to start. Upgrade when you want every feature, every car, every time.
          </p>

          {/* Monthly / Yearly toggle */}
          <div className="inline-flex mt-8 p-1 rounded-full bg-spotter-panel border border-spotter-line">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "relative px-5 py-2 rounded-full text-sm font-medium transition-colors",
                !isYearly ? "text-white" : "text-spotter-mute"
              )}
            >
              {!isYearly && (
                <motion.span
                  layoutId="billing-switch"
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-spotter-orange to-spotter-red"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative">Monthly</span>
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "relative px-5 py-2 rounded-full text-sm font-medium transition-colors",
                isYearly ? "text-white" : "text-spotter-mute"
              )}
            >
              {isYearly && (
                <motion.span
                  layoutId="billing-switch"
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-spotter-orange to-spotter-red"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                Yearly
                <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                  save 28%
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(
                  "relative rounded-2xl p-7 border",
                  tier.popular
                    ? "border-spotter-orange/40 bg-gradient-to-b from-spotter-panel to-spotter-ink shadow-[0_-13px_180px_rgba(255,122,46,0.30)] z-10"
                    : "border-spotter-line bg-spotter-panel/60"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-gradient-to-r from-spotter-orange to-spotter-red text-white">
                    Most popular
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5 text-spotter-orange" />
                  <h3 className="text-2xl font-semibold">{tier.name}</h3>
                </div>
                <p className="text-xs text-spotter-mute mb-6">{tier.tagline}</p>

                <div className="flex items-baseline mb-1">
                  {tier.monthly === 0 ? (
                    <>
                      <span className="text-5xl font-semibold">$0</span>
                      <span className="text-spotter-mute ml-1.5">forever</span>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-semibold">$</span>
                      <NumberFlow
                        value={isYearly ? tier.yearly : tier.monthly}
                        className="text-5xl font-semibold"
                        format={{ minimumFractionDigits: 2 }}
                      />
                      <span className="text-spotter-mute ml-1.5">/{isYearly ? "yr" : "mo"}</span>
                    </>
                  )}
                </div>
                {tier.monthly === 0 ? (
                  <p className="text-xs text-emerald-400 mb-4">No credit card required</p>
                ) : isYearly ? (
                  <p className="text-xs text-emerald-400 mb-4">
                    Just ${(tier.yearly / 12).toFixed(2)}/mo billed annually
                  </p>
                ) : (
                  <div className="h-4" />
                )}

                <button
                  className={cn(
                    "w-full py-3.5 rounded-xl font-semibold tracking-wide text-sm transition-transform active:scale-[0.98] mb-7",
                    tier.popular
                      ? `bg-gradient-to-r ${tier.accent} text-white shadow-lg shadow-spotter-orange/30`
                      : "bg-white text-spotter-ink hover:bg-white/90"
                  )}
                >
                  {tier.cta}
                </button>

                <ul className="space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-spotter-orange" />
                      <span className="text-zinc-300">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-spotter-mute mt-8">
          Cancel any time. Free tier never expires. Tax may apply.
        </p>
      </div>
    </section>
  );
}
