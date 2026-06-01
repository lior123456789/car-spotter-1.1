"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  ArrowLeft,
  Upload,
  Sparkles,
  Trophy,
  Crown,
  X,
  Loader2,
  ImageIcon,
  Check,
  Lock,
} from "lucide-react";

type ScanResult = {
  make: string;
  model: string;
  year: string;
  category: string;
  msrp: string;
  valueRange: string;
  engine: string;
  horsepower: string;
  zeroToSixty: string;
  rarity: number;
  celebrity?: string;
  funFact: string;
  thumb: string;
};

// Realistic mock identifications, picked at random per scan.
const POOL: ScanResult[] = [
  {
    make: "Ferrari",
    model: "SF90 Stradale",
    year: "2020–2023",
    category: "Supercar",
    msrp: "$507,000",
    valueRange: "$550k – $750k",
    engine: "4.0L Twin-Turbo V8 PHEV",
    horsepower: "986 hp",
    zeroToSixty: "2.5 s",
    rarity: 8,
    celebrity: "David Beckham",
    funFact: "First production Ferrari to use a plug-in hybrid powertrain — the V8 alone makes 769 hp.",
    thumb: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  },
  {
    make: "Porsche",
    model: "911 GT3 RS (992)",
    year: "2023–2024",
    category: "Supercar",
    msrp: "$241,300",
    valueRange: "$290k – $360k",
    engine: "4.0L NA Flat-Six",
    horsepower: "518 hp",
    zeroToSixty: "3.0 s",
    rarity: 7,
    funFact: "DRS system borrowed from F1 — the rear wing can flatten itself mid-corner to keep top speed up.",
    thumb: "https://images.unsplash.com/photo-1611821064430-0d40291922d2?w=800&q=80",
  },
  {
    make: "Lamborghini",
    model: "Huracán Sterrato",
    year: "2023–2024",
    category: "Supercar",
    msrp: "$273,000",
    valueRange: "$290k – $330k",
    engine: "5.2L NA V10",
    horsepower: "602 hp",
    zeroToSixty: "3.4 s",
    rarity: 7,
    funFact: "First production supercar designed for gravel and dirt — 1.7-inch lift, rally tires, roof scoop.",
    thumb: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  },
  {
    make: "Nissan",
    model: "Skyline GT-R R34 V-Spec II",
    year: "2000–2002",
    category: "JDM Legend",
    msrp: "$56,000 (original)",
    valueRange: "$280k – $420k",
    engine: "2.6L Twin-Turbo I6 (RB26DETT)",
    horsepower: "276 hp (claimed) · ~330 actual",
    zeroToSixty: "4.9 s",
    rarity: 9,
    funFact: "All Japan-market R34s were officially rated at 276 hp due to the 'gentleman's agreement' — most made closer to 330.",
    thumb: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&q=80",
  },
  {
    make: "Mercedes-Benz",
    model: "300SL Gullwing",
    year: "1954–1957",
    category: "Classic",
    msrp: "$7,500 (1955)",
    valueRange: "$1.4M – $1.8M",
    engine: "3.0L Inline-6 (M198)",
    horsepower: "215 hp",
    zeroToSixty: "8.8 s",
    rarity: 10,
    celebrity: "Clark Gable",
    funFact: "World's first production car with fuel injection. The gullwing doors weren't a styling choice — the tubular space frame left no room for normal doors.",
    thumb: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  },
  {
    make: "BMW",
    model: "M3 E30 Sport Evolution",
    year: "1990",
    category: "Classic",
    msrp: "$53,000 (1990)",
    valueRange: "$220k – $310k",
    engine: "2.5L NA Inline-4 (S14)",
    horsepower: "238 hp",
    zeroToSixty: "6.1 s",
    rarity: 9,
    funFact: "Only 600 Sport Evolutions built. The S14 engine was developed from Brabham's Formula 1 four-cylinder.",
    thumb: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
  },
  {
    make: "Aston Martin",
    model: "Valkyrie",
    year: "2022–2024",
    category: "Hypercar",
    msrp: "$3,000,000",
    valueRange: "$3.4M – $3.9M",
    engine: "6.5L NA V12 + Hybrid",
    horsepower: "1,160 hp",
    zeroToSixty: "2.5 s",
    rarity: 10,
    funFact: "Co-developed with Adrian Newey of Red Bull Racing. Revs to 11,100 rpm — the highest of any production road car.",
    thumb: "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=800&q=80",
  },
];

const FREE_LIMIT = 3;
const STORAGE_KEY = "carsspotter:freeScans";

function getUsed(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export default function ScanPage() {
  const [used, setUsed] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [paywall, setPaywall] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsed(getUsed());
  }, []);

  const remaining = Math.max(0, FREE_LIMIT - used);

  function pickResult(): ScanResult {
    return POOL[Math.floor(Math.random() * POOL.length)];
  }

  function startScan(previewSrc: string) {
    if (used >= FREE_LIMIT) {
      setPaywall(true);
      return;
    }
    setPreview(previewSrc);
    setResult(null);
    setScanning(true);
    setProgress(0);

    // Animated progress: 4 stages over ~2.4s
    const stages = [25, 55, 82, 100];
    stages.forEach((p, i) => {
      setTimeout(() => setProgress(p), 400 * (i + 1));
    });

    setTimeout(() => {
      const picked = pickResult();
      setResult(picked);
      setScanning(false);
      const next = used + 1;
      setUsed(next);
      localStorage.setItem(STORAGE_KEY, String(next));
    }, 2400);
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => startScan(reader.result as string);
    reader.readAsDataURL(file);
  }

  function tryAgain() {
    setResult(null);
    setPreview(null);
    setProgress(0);
  }

  function resetFreeScans() {
    localStorage.removeItem(STORAGE_KEY);
    setUsed(0);
    setPaywall(false);
  }

  const SAMPLES = [
    { label: "Ferrari SF90",       src: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80" },
    { label: "Porsche GT3 RS",     src: "https://images.unsplash.com/photo-1611821064430-0d40291922d2?w=800&q=80" },
    { label: "Lamborghini Huracán",src: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80" },
    { label: "Nissan R34 GT-R",    src: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&q=80" },
  ];

  return (
    <main className="min-h-screen bg-spotter-ink text-white">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-spotter-ink/80 border-b border-spotter-line">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-spotter-mute hover:text-white transition flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="h-5 w-px bg-spotter-line" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-spotter-orange to-spotter-red grid place-items-center">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold tracking-tight">CarSpotter</span>
              <span className="text-xs text-spotter-mute">/ Free Scan</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs px-3 py-1.5 rounded-full border border-spotter-line bg-spotter-panel/60">
              <span className="text-spotter-mute">Free scans · </span>
              <span className="font-semibold text-white">{remaining}</span>
              <span className="text-spotter-mute"> / {FREE_LIMIT} left</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-12">
        {!preview && !result && (
          <>
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.24em] text-spotter-orange mb-3">Free trial</p>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
                Snap your first car. <span className="gradient-text">It's on us.</span>
              </h1>
              <p className="text-spotter-mute max-w-xl mx-auto">
                Upload a photo of any car (or try one of our samples). Our AI returns make, model,
                year, MSRP, today's market value, rarity score and a fun fact in about 2 seconds.
              </p>
            </div>

            <motion.label
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              htmlFor="upload"
              className="block max-w-2xl mx-auto cursor-pointer rounded-2xl border-2 border-dashed border-spotter-line bg-spotter-panel/40 hover:border-spotter-orange/60 hover:bg-spotter-panel/60 transition p-10 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-spotter-orange to-spotter-red grid place-items-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-lg font-semibold mb-1">Upload a car photo</div>
              <div className="text-sm text-spotter-mute">JPG, PNG or HEIC up to 10MB</div>
              <input
                id="upload"
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="hidden"
              />
            </motion.label>

            <div className="text-center text-xs text-spotter-mute mt-6 mb-4 uppercase tracking-widest">
              or try a sample
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => startScan(s.src)}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-spotter-line hover:border-spotter-orange/60 transition group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt={s.label} className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-xs font-medium text-left">
                    {s.label}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center mt-10 text-xs text-spotter-mute">
              No signup. No card. Free scans live in this browser — clear them anytime by{" "}
              <button onClick={resetFreeScans} className="underline hover:text-white">
                resetting your trial
              </button>.
            </div>
          </>
        )}

        {/* Preview + scanning state */}
        {preview && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-spotter-line bg-spotter-panel/40">
              <div className="relative aspect-[16/10] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="w-full h-full object-cover" />
                {scanning && (
                  <>
                    {/* Scanning line */}
                    <motion.div
                      initial={{ y: 0 }}
                      animate={{ y: "100%" }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 top-0 h-12 bg-gradient-to-b from-spotter-orange/30 to-transparent border-b-2 border-spotter-orange"
                    />
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-spotter-orange mb-3" />
                      <div className="text-xs uppercase tracking-widest text-spotter-mute mb-2">
                        {progress < 30 && "Detecting body shape…"}
                        {progress >= 30 && progress < 60 && "Matching grille + headlights…"}
                        {progress >= 60 && progress < 90 && "Cross-referencing 500k models…"}
                        {progress >= 90 && "Pulling market data…"}
                      </div>
                      <div className="w-48 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <motion.div
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.35 }}
                          className="h-full bg-gradient-to-r from-spotter-orange to-spotter-red"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 rounded-2xl border border-spotter-line bg-spotter-panel/50 p-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] uppercase tracking-widest">
                      <Check className="w-3 h-3" /> Identified
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-spotter-mute">{result.year}</div>
                    <div className="text-[10px] uppercase tracking-widest bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded">
                      {result.category}
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                    {result.make} <span className="gradient-text">{result.model}</span>
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-3 mt-5">
                    <Stat label="Original MSRP"  value={result.msrp} />
                    <Stat label="Value today"    value={result.valueRange} accent />
                    <Stat label="Engine"         value={result.engine} />
                    <Stat label="Horsepower"     value={result.horsepower} />
                    <Stat label="0–60 mph"       value={result.zeroToSixty} />
                    <Stat label="Rarity"         value={`${result.rarity}/10`} bar={result.rarity * 10} />
                  </div>

                  {result.celebrity && (
                    <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                      <div className="text-[10px] uppercase tracking-widest text-amber-300 mb-0.5 flex items-center gap-1.5">
                        <Trophy className="w-3 h-3" /> Celebrity owner on record
                      </div>
                      <div className="text-sm font-medium text-white">{result.celebrity}</div>
                    </div>
                  )}

                  <div className="mt-4 rounded-xl bg-spotter-ink border border-spotter-line p-4">
                    <div className="text-[10px] uppercase tracking-widest text-spotter-orange mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Did you know
                    </div>
                    <p className="text-sm text-zinc-200 leading-relaxed">{result.funFact}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={tryAgain}
                      className="inline-flex items-center gap-2 bg-white text-spotter-ink font-semibold px-5 py-3 rounded-xl hover:bg-white/90 transition text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Scan another ({remaining} left)
                    </button>
                    <Link
                      href="/#pricing"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-orange to-spotter-red text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-spotter-orange/30 hover:brightness-110 transition text-sm"
                    >
                      <Crown className="w-4 h-4" />
                      Unlock unlimited
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Paywall */}
      <AnimatePresence>
        {paywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setPaywall(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full rounded-2xl border border-spotter-orange/30 bg-gradient-to-b from-spotter-panel to-spotter-ink p-8 shadow-[0_-13px_180px_rgba(255,122,46,0.30)]"
            >
              <button
                onClick={() => setPaywall(false)}
                className="absolute top-3 right-3 text-spotter-mute hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-spotter-orange to-spotter-red grid place-items-center mb-4">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight mb-2">You've used all 3 free scans</h3>
              <p className="text-sm text-spotter-mute mb-5">
                Upgrade to keep scanning, unlock the full spec sheet, celebrity owners, market value charts,
                the Spot Map, and unlimited Ask-the-AI.
              </p>
              <Link
                href="/#pricing"
                className="block w-full text-center bg-gradient-to-r from-spotter-orange to-spotter-red text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-spotter-orange/30 hover:brightness-110 transition mb-2"
              >
                See plans (from $6.99/mo)
              </Link>
              <button
                onClick={resetFreeScans}
                className="block w-full text-center text-xs text-spotter-mute hover:text-white py-2 transition"
              >
                Reset trial (dev / demo)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Stat({ label, value, accent = false, bar }: { label: string; value: string; accent?: boolean; bar?: number }) {
  return (
    <div className={"rounded-lg border p-3 " + (accent ? "border-spotter-orange/30 bg-spotter-orange/5" : "border-spotter-line bg-spotter-ink/50")}>
      <div className="text-[10px] uppercase tracking-widest text-spotter-mute">{label}</div>
      <div className={"text-sm font-semibold mt-0.5 " + (accent ? "text-spotter-orange" : "text-white")}>{value}</div>
      {bar !== undefined && (
        <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-spotter-orange to-spotter-red" style={{ width: `${bar}%` }} />
        </div>
      )}
    </div>
  );
}
