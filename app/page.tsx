"use client";
import { motion } from "framer-motion";
import { Camera, ArrowRight, Sparkles as SparklesIcon, ShieldCheck, Apple, Smartphone } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Features } from "@/components/sections/Features";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";

export default function Page() {
  return (
    <main className="bg-spotter-ink text-white overflow-x-hidden">
      {/* ─────────── Nav ─────────── */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-spotter-ink/70 border-b border-spotter-line">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spotter-orange to-spotter-red grid place-items-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">CarSpotter</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <a
            href="#pricing"
            className="inline-flex items-center gap-1 bg-gradient-to-r from-spotter-orange to-spotter-red text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg shadow-spotter-orange/20 hover:brightness-110 transition"
          >
            Start free
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* ─────────── Hero ─────────── */}
      <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FF7A2E" />

        {/* radial glow */}
        <div
          aria-hidden
          className="absolute inset-0 -z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(255,122,46,0.18), transparent 70%)," +
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,61,90,0.10), transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-spotter-line bg-spotter-panel/60 text-xs text-zinc-300 mb-7">
            <SparklesIcon className="w-3.5 h-3.5 text-spotter-orange" />
            <span>Powered by Claude · 500,000+ models indexed</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-semibold leading-[1.02] tracking-tight mb-6">
            <VerticalCutReveal splitBy="words" staggerDuration={0.06} staggerFrom="first">
              Snap any car.
            </VerticalCutReveal>
            <span className="block gradient-text mt-2">
              <VerticalCutReveal splitBy="words" staggerDuration={0.06} staggerFrom="first"
                transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.5 }}>
                Know everything.
              </VerticalCutReveal>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-9 leading-relaxed"
          >
            Point your phone at any car. Get make, model, year, original price, today's value,
            rarity score, celebrity owners, even the engine sound — in two seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-orange to-spotter-red text-white font-semibold px-6 py-3.5 rounded-xl shadow-xl shadow-spotter-orange/30 hover:brightness-110 transition"
            >
              <Apple className="w-5 h-5" />
              Download for iPhone
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-white/5 border border-spotter-line text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition"
            >
              <Smartphone className="w-5 h-5" />
              Get it on Android
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-xs text-spotter-mute"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Free forever tier. No card. No spam. Cancel anytime.</span>
          </motion.div>
        </div>
      </section>

      {/* ─────────── Social proof strip ─────────── */}
      <section className="border-y border-spotter-line bg-spotter-panel/30 py-10">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: "500K+", label: "Models indexed" },
            { stat: "2.4M",  label: "Cars identified" },
            { stat: "97.4%", label: "ID accuracy" },
            { stat: "4.9★",  label: "App Store rating" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-semibold gradient-text">{s.stat}</div>
              <div className="text-xs uppercase tracking-wider text-spotter-mute mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── How it works (scroll showcase) ─────────── */}
      <section id="how" className="relative bg-spotter-ink overflow-hidden">
        <ContainerScroll
          titleComponent={
            <div className="px-4">
              <p className="text-sm uppercase tracking-[0.24em] text-spotter-orange mb-3">How it works</p>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
                Three taps. <span className="gradient-text">Every fact.</span>
              </h2>
              <p className="text-spotter-mute mt-4 max-w-xl mx-auto">
                Open. Snap. Done. The full report appears in the time it takes you to swipe up.
              </p>
            </div>
          }
        >
          {/* Mock app preview — pure CSS, no asset dependency */}
          <div className="h-full w-full p-6 md:p-10 grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-black/40 border border-spotter-line p-6 flex flex-col">
              <div className="text-xs uppercase tracking-widest text-spotter-mute mb-2">2020–2023</div>
              <div className="text-3xl font-semibold">Ferrari</div>
              <div className="text-spotter-mute text-lg mb-4">SF90 Stradale</div>
              <span className="self-start text-xs bg-blue-500/15 text-blue-300 px-2.5 py-1 rounded-full">SUPERCAR</span>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Stat label="MSRP" value="$507,000" />
                <Stat label="Value today" value="$550–750k" />
                <Stat label="Engine" value="V8 PHEV" />
                <Stat label="0–60" value="2.5 s" />
              </div>
              <div className="mt-auto pt-6">
                <div className="text-xs uppercase tracking-widest text-spotter-mute mb-1.5">Rarity</div>
                <div className="flex items-center gap-2">
                  <div className="text-spotter-orange font-semibold text-2xl">8/10</div>
                  <div className="h-1.5 rounded-full bg-zinc-800 flex-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-spotter-orange to-spotter-red" style={{ width: "80%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-black/40 border border-spotter-line p-6 flex flex-col">
              <div className="text-xs uppercase tracking-widest text-spotter-orange mb-2">Celebrity connection</div>
              <div className="text-2xl font-semibold mb-2">David Beckham</div>
              <p className="text-sm text-spotter-mute mb-6">
                Documented and photographed with his SF90 Stradale, having taken delivery in 2021.
              </p>
              <div className="text-xs uppercase tracking-widest text-spotter-mute mb-2">Market value</div>
              <svg viewBox="0 0 300 80" className="w-full h-16 mb-4">
                <path d="M0,70 C50,60 100,40 150,30 C200,20 250,10 300,5"
                      fill="none" stroke="#FF7A2E" strokeWidth="2" />
                <path d="M0,70 C50,60 100,40 150,30 C200,20 250,10 300,5 L300,80 L0,80 Z"
                      fill="url(#g1)" />
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#FF7A2E" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#FF7A2E" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="mt-auto rounded-xl bg-spotter-panel/60 border border-spotter-line p-4">
                <div className="text-xs uppercase tracking-widest text-spotter-orange mb-1">Powered by Claude</div>
                <p className="text-sm text-zinc-200">I've identified this as a 2020–2023 Ferrari SF90 Stradale. Ask me anything.</p>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </section>

      <Features />
      <Pricing />
      <FAQ />

      {/* ─────────── CTA + footer ─────────── */}
      <section className="bg-spotter-ink border-t border-spotter-line py-20 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Stop guessing. <span className="gradient-text">Start spotting.</span>
        </h2>
        <p className="text-spotter-mute max-w-md mx-auto mb-8">
          Free forever tier. Upgrade when you want more. The next car you walk past — you'll know.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#pricing" className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-orange to-spotter-red text-white font-semibold px-6 py-3.5 rounded-xl shadow-xl shadow-spotter-orange/30 hover:brightness-110 transition">
            <Apple className="w-5 h-5" /> Download for iPhone
          </a>
          <a href="#pricing" className="inline-flex items-center gap-2 bg-white/5 border border-spotter-line text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition">
            <Smartphone className="w-5 h-5" /> Get it on Android
          </a>
        </div>
      </section>

      <footer className="bg-spotter-ink border-t border-spotter-line py-10 px-4 text-center text-spotter-mute text-xs">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Camera className="w-3.5 h-3.5 text-spotter-orange" />
          <span className="font-semibold text-zinc-300">CarSpotter</span>
        </div>
        <div className="flex justify-center gap-6 mb-3">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="mailto:hi@carsspotter.app" className="hover:text-white">Contact</a>
        </div>
        <p>© 2026 CarSpotter. Made by people who once stood on a curb arguing whether a 911 was a 996.2 or a 997.1.</p>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-spotter-panel/60 border border-spotter-line p-3">
      <div className="text-[10px] uppercase tracking-widest text-spotter-mute">{label}</div>
      <div className="text-sm font-semibold text-white mt-0.5">{value}</div>
    </div>
  );
}
