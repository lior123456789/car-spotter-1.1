"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "How accurate is the AI?",
    a: "97.4% on the year/make/model triplet, 99.1% on make alone. We use a vision model fine-tuned on a 12-million-image car dataset, then layer Claude on top to handle edge cases (rare imports, prototypes, kit cars, replicas)." },
  { q: "Does it work on photos I didn't take?",
    a: "Yes. Screenshots from Instagram, eBay listings, BaT auctions, your dad's old shoebox photos — anything works. Glare, dirt, partial views, weird angles are all handled." },
  { q: "What if it identifies the wrong car?",
    a: "Open the AI chat at the bottom of the result and tell it. Claude will refine the answer or kick it to a human expert if it's a real edge case. We learn from every correction." },
  { q: "Where do the market values come from?",
    a: "We aggregate Bring a Trailer, Cars.com, AutoTrader, Hemmings, RM Sotheby's, Gooding & Co., Mecum, and dealer-only feeds. Values update daily. Collector & Concours tiers see source-level breakdowns." },
  { q: "Is my photo private?",
    a: "Yes. Your photos never leave your device unless you explicitly share a spot. We don't sell data, we don't train on your images. The whole product is built on a paid subscription so we don't have to." },
  { q: "Do you cover bikes, trucks, boats?",
    a: "Bikes yes — Ducati, BMW, Royal Enfield, you name it. Trucks (pickup, lifted, classic) yes. Boats and planes are in the roadmap for late 2026." },
  { q: "Why is this better than searching Google?",
    a: "Try it. Take a photo of a 1992 Lancia Delta Integrale Evo II and tell us how long Google takes vs CarSpotter. We built this because we got tired of typing 'red Italian hatchback flared fenders' into a search bar." },
  { q: "Can I cancel anytime?",
    a: "One tap. We don't hide the cancel button, we don't make you call. Subscriptions are managed through Apple/Google so it's the same flow as cancelling any other app." },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-spotter-ink py-24 md:py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.24em] text-spotter-orange mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Quick answers.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <button
                key={i}
                onClick={() => setOpenIdx(open ? null : i)}
                className={cn(
                  "w-full text-left rounded-xl border bg-spotter-panel/40 transition-colors",
                  open ? "border-spotter-orange/40" : "border-spotter-line hover:border-spotter-line/80"
                )}
              >
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 shrink-0 text-spotter-mute transition-transform duration-300",
                      open && "rotate-180 text-spotter-orange"
                    )}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-spotter-mute leading-relaxed text-sm">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
