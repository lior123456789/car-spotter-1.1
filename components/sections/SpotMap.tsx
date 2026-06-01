"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Crown, MapPin, Lock } from "lucide-react";

// Dynamically import the WHOLE inner map block so MapContext lives in one module.
const SpotMapInner = dynamic(() => import("./SpotMapInner").then((m) => m.SpotMapInner), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] w-full grid place-items-center bg-spotter-panel/40">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-spotter-orange animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-spotter-orange animate-pulse [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-spotter-orange animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  ),
});

export function SpotMap() {
  return (
    <section id="spotmap" className="relative bg-spotter-ink py-24 md:py-32 px-4 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-spotter-orange/40 to-transparent" />
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[120%] h-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(255,122,46,0.35), transparent)" }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 mb-4">
            <Crown className="w-3.5 h-3.5" />
            Premium feature · Collector & Concours
          </div>
          <p className="text-sm uppercase tracking-[0.24em] text-spotter-orange mb-3">Spot Map</p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
            Know where to <span className="gradient-text">stand</span>.
          </h2>
          <p className="text-spotter-mute max-w-2xl mx-auto">
            We aggregate sighting data from public posts, valet logs, concours calendars and dealer events
            to map the spots where rare cars actually show up. Plan the next photo, not the next missed one.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden border border-spotter-line bg-spotter-panel/40 shadow-[0_-13px_180px_rgba(255,122,46,0.18)]"
        >
          <SpotMapInner />

          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-spotter-line">
            {[
              { label: "Spots indexed",    value: "1,840+" },
              { label: "Countries",        value: "47" },
              { label: "Sightings logged", value: "284K" },
              { label: "Update frequency", value: "Hourly" },
            ].map((s) => (
              <div key={s.label} className="px-5 py-4 border-r border-spotter-line/60 last:border-r-0">
                <div className="text-lg font-semibold gradient-text">{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-spotter-mute mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-spotter-mute">
            <Lock className="w-3.5 h-3.5" />
            Live data + alerts unlock with Collector & Concours
          </div>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-orange to-spotter-red text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-spotter-orange/30 hover:brightness-110 transition text-sm"
          >
            <MapPin className="w-4 h-4" />
            Unlock the Spot Map
          </a>
        </div>
      </div>
    </section>
  );
}
