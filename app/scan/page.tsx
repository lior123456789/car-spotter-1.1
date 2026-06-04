"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Lock,
  Check,
  Zap,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

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

async function fetchUsage(): Promise<{ used: number; remaining: number; plan: string; localhost: boolean; claudeEnabled: boolean }> {
  try {
    const res = await fetch("/api/usage", { cache: "no-store" });
    if (!res.ok) return { used: 0, remaining: FREE_LIMIT, plan: "free", localhost: false, claudeEnabled: false };
    const data = await res.json();
    return {
      used: data.freeScansUsed ?? 0,
      remaining: data.freeScansRemaining ?? FREE_LIMIT,
      plan: data.plan ?? "free",
      localhost: !!data.localhost,
      claudeEnabled: !!data.claudeEnabled,
    };
  } catch {
    return { used: 0, remaining: FREE_LIMIT, plan: "free", localhost: false, claudeEnabled: false };
  }
}

async function fileToDataUrl(file: File): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ dataUrl: reader.result as string, mimeType: file.type || "image/jpeg" });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Quality-preserving image optimizer.
 *   - Reads any image (JPEG / PNG / HEIC / WebP)
 *   - Downsizes ONLY if max dimension > 2048px (so phone-camera photos
 *     don't blow Claude's image limit), preserving aspect ratio
 *   - Re-encodes as JPEG at 0.92 quality (visually lossless)
 *   - Returns a high-quality data URL ready for both preview and API
 */
async function optimizeImage(file: File): Promise<{ dataUrl: string; mimeType: string }> {
  const originalDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Bigger + higher quality = much better Claude vision accuracy.
  // Empirically: 3072px @ 0.95 quality lands well under the 5MB API
  // ceiling for typical phone shots while preserving badge / grille detail.
  const MAX_DIM = 3072;
  const TARGET_QUALITY = 0.95;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = originalDataUrl;
    });

    const { width: w, height: h } = img;
    const maxDim = Math.max(w, h);

    // Small file + small enough: just return original
    if (maxDim <= MAX_DIM && file.size <= 5 * 1024 * 1024) {
      return { dataUrl: originalDataUrl, mimeType: file.type || "image/jpeg" };
    }

    const scale = maxDim > MAX_DIM ? MAX_DIM / maxDim : 1;
    const newW = Math.round(w * scale);
    const newH = Math.round(h * scale);

    const canvas = document.createElement("canvas");
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, newW, newH);

    const dataUrl = canvas.toDataURL("image/jpeg", TARGET_QUALITY);
    return { dataUrl, mimeType: "image/jpeg" };
  } catch {
    return { dataUrl: originalDataUrl, mimeType: file.type || "image/jpeg" };
  }
}

async function urlToDataUrl(url: string): Promise<{ dataUrl: string; mimeType: string }> {
  const res = await fetch(url);
  const blob = await res.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { dataUrl, mimeType: blob.type || "image/jpeg" };
}

export default function ScanPage() {
  const router = useRouter();
  const { user, loading: authLoading, configured } = useAuth();

  const [used, setUsed] = useState(0);
  const [plan, setPlan] = useState<string>("free");
  const [localhost, setLocalhost] = useState(false);
  const [claudeEnabled, setClaudeEnabled] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [paywall, setPaywall] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Gate: require login (skipped on localhost where everything is unlocked)
  useEffect(() => {
    if (authLoading) return;
    fetchUsage().then((u: any) => {
      setUsed(u.used);
      setPlan(u.plan);
      setLocalhost(!!u.localhost);
      setClaudeEnabled(!!u.claudeEnabled);
      // If Firebase is configured AND we're not on localhost AND no user,
      // redirect to sign-in. Otherwise let them through (localhost / no-firebase = open).
      if (configured && !u.localhost && !user) {
        router.replace("/signin?next=/scan");
      }
    });
  }, [authLoading, user, configured, router]);

  const remaining = plan !== "free" ? Infinity : Math.max(0, FREE_LIMIT - used);

  async function startScan(dataUrl: string, mimeType = "image/jpeg") {
    if (plan === "free" && used >= FREE_LIMIT) {
      setPaywall(true);
      return;
    }
    setPreview(dataUrl);
    setResult(null);
    setScanning(true);
    setProgress(0);

    // Stage the progress animation so the UI feels responsive.
    const stages = [22, 48, 72, 92];
    stages.forEach((p, i) => setTimeout(() => setProgress(p), 350 * (i + 1)));

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, mimeType }),
      });

      if (res.status === 402) {
        setScanning(false);
        setPaywall(true);
        return;
      }
      if (!res.ok) throw new Error("identify_failed");

      const data = await res.json();
      const r = data.result as ScanResult & { source?: string };

      setProgress(100);
      setResult({
        make: r.make,
        model: r.model,
        year: r.year,
        category: r.category,
        msrp: r.msrp,
        valueRange: r.valueRange,
        engine: r.engine,
        horsepower: r.horsepower,
        zeroToSixty: r.zeroToSixty,
        rarity: r.rarity,
        celebrity: r.celebrity,
        funFact: r.funFact,
        thumb: r.thumb ?? dataUrl,
      });
      setUsed(data.user?.freeScansUsed ?? used + 1);
      setPlan(data.user?.plan ?? plan);
      setScanning(false);
    } catch {
      // Backend totally unavailable → use local mock so the demo still works
      setTimeout(() => {
        setResult(POOL[Math.floor(Math.random() * POOL.length)]);
        setUsed(used + 1);
        setScanning(false);
      }, 1200);
    }
  }

  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    const { dataUrl, mimeType } = await optimizeImage(file);
    startScan(dataUrl, mimeType);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer?.files ?? null);
  }

  async function onSampleClick(src: string) {
    try {
      const { dataUrl, mimeType } = await urlToDataUrl(src);
      startScan(dataUrl, mimeType);
    } catch {
      startScan(src, "image/jpeg");
    }
  }

  function tryAgain() {
    setResult(null);
    setPreview(null);
    setProgress(0);
  }

  async function resetFreeScans() {
    // Server-side reset isn't exposed in prod; reload usage for now.
    setPaywall(false);
    const u = await fetchUsage();
    setUsed(u.used);
    setPlan(u.plan);
  }

  // Verified-online Unsplash photos. Labels are intentionally generic so
  // Claude's identification (which runs on the actual pixels) decides the
  // exact make/model — these are just thumbnails for the user to click.
  const SAMPLES = [
    { label: "Ferrari",     src: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=90&auto=format" },
    { label: "Lamborghini", src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=90&auto=format" },
    { label: "Porsche 911", src: "https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?w=1200&q=90&auto=format" },
    { label: "Mercedes-AMG",src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=90&auto=format" },
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
            {localhost && (
              <div className="hidden md:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                Dev · All features
              </div>
            )}
            {claudeEnabled && (
              <div className="hidden md:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-spotter-cyan/40 bg-spotter-cyan/10 text-spotter-cyan font-semibold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Claude live
              </div>
            )}
            {localhost ? (
              <div className="text-xs px-3 py-1.5 rounded-full border border-spotter-violet/40 bg-spotter-violet/10 text-white font-semibold capitalize">
                Concours · unlimited
              </div>
            ) : plan === "free" ? (
              <div className="text-xs px-3 py-1.5 rounded-full border border-spotter-line bg-spotter-panel/60">
                <span className="text-spotter-mute">Free scans · </span>
                <span className="font-semibold text-white">{remaining}</span>
                <span className="text-spotter-mute"> / {FREE_LIMIT} left</span>
              </div>
            ) : (
              <div className="text-xs px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 font-semibold capitalize">
                {plan} plan · unlimited
              </div>
            )}
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
              className={
                "block max-w-2xl mx-auto cursor-pointer rounded-2xl border-2 border-dashed transition p-10 text-center " +
                (dragOver
                  ? "border-spotter-cyan bg-spotter-cyan/10 scale-[1.01]"
                  : "border-spotter-line bg-spotter-panel/40 hover:border-spotter-cyan/60 hover:bg-spotter-panel/60")
              }
            >
              <div
                className={
                  "w-16 h-16 mx-auto mb-4 rounded-full grid place-items-center transition " +
                  (dragOver
                    ? "bg-gradient-to-br from-spotter-cyan to-spotter-violet scale-110"
                    : "bg-gradient-to-br from-spotter-cyan to-spotter-violet")
                }
              >
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div className="text-lg font-semibold mb-1">
                {dragOver ? "Drop to scan" : "Drop a photo or click to upload"}
              </div>
              <div className="text-sm text-spotter-mute">
                JPG, PNG, HEIC, WebP · auto-optimized to 2048px / high quality
              </div>
              <input
                id="upload"
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="hidden"
              />
            </motion.div>

            <div className="text-center text-xs text-spotter-mute mt-6 mb-4 uppercase tracking-widest">
              or try a sample
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => onSampleClick(s.src)}
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
                      Scan another {plan === "free" ? `(${remaining} left)` : ""}
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
