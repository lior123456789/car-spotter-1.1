"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  ArrowLeft,
  Star,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronRight,
  Crown,
  Trophy,
  Activity,
} from "lucide-react";
import { SCANS, USAGE, aggregateStats } from "@/lib/data";
import { PostCheckoutSync } from "@/components/PostCheckoutSync";

const stats = aggregateStats();

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export default function DashboardPage() {
  const maxUsage = Math.max(...USAGE.map((u) => u.scans));
  const totalUsage = USAGE.reduce((a, b) => a + b.scans, 0);

  const categoryEntries = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);
  const totalCats = categoryEntries.reduce((a, [, v]) => a + v, 0);

  return (
    <main className="min-h-screen bg-spotter-ink text-white">
      <Suspense fallback={null}>
        <PostCheckoutSync />
      </Suspense>
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-spotter-ink/80 border-b border-spotter-line">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
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
              <span className="text-xs text-spotter-mute">/ Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300">
              <Crown className="w-3.5 h-3.5" />
              Collector plan · renews Jun 18
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spotter-orange to-spotter-red grid place-items-center text-xs font-semibold">
              P
            </div>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <div className="max-w-7xl mx-auto px-5 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-spotter-orange mb-2">Your activity</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Welcome back, <span className="gradient-text">Paul</span>
          </h1>
          <p className="text-spotter-mute text-sm mt-2">
            {totalUsage.toLocaleString()} scans across the last 14 days · {stats.totalScans} cars in your collection
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Kpi
            icon={Activity}
            label="Total scans"
            value={stats.totalScans.toString()}
            sub="lifetime"
          />
          <Kpi
            icon={TrendingUp}
            label="Portfolio value"
            value={formatMoney(stats.portfolioValueLow)}
            sub={`to ${formatMoney(stats.portfolioValueHigh)} today`}
            accent
          />
          <Kpi
            icon={Star}
            label="Rarest spotted"
            value={stats.rarestLabel ?? "—"}
            sub="rarity 10/10"
            truncate
          />
          <Kpi
            icon={MapPin}
            label="Spots visited"
            value="11"
            sub="of 1,840 indexed"
          />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {/* Usage chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 rounded-2xl border border-spotter-line bg-spotter-panel/50 p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-spotter-mute">Daily scans · last 14 days</div>
                <div className="text-xl font-semibold mt-0.5">{totalUsage.toLocaleString()} scans</div>
              </div>
              <div className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-medium">
                +12% vs. previous
              </div>
            </div>
            <div className="h-44 flex items-end gap-1.5">
              {USAGE.map((u, i) => {
                const h = (u.scans / maxUsage) * 100;
                return (
                  <div key={u.day} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.03, duration: 0.5, ease: "easeOut" }}
                      className="w-full rounded-t-md bg-gradient-to-t from-spotter-orange to-spotter-red"
                      title={`${u.day}: ${u.scans} scans`}
                    />
                    <span className="text-[9px] text-spotter-mute">
                      {u.day.slice(8, 10)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Category breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-spotter-line bg-spotter-panel/50 p-5"
          >
            <div className="text-xs uppercase tracking-widest text-spotter-mute mb-1">Collection by category</div>
            <div className="text-xl font-semibold mb-4">{stats.totalScans} cars</div>
            <ul className="space-y-3">
              {categoryEntries.map(([cat, count], i) => {
                const pct = (count / totalCats) * 100;
                return (
                  <li key={cat}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-200">{cat}</span>
                      <span className="text-spotter-mute">{count} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-spotter-orange to-spotter-red"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>

        {/* Scan history */}
        <div className="rounded-2xl border border-spotter-line bg-spotter-panel/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-spotter-line flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-spotter-mute">Scan history</div>
              <div className="text-lg font-semibold">Recent spots</div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-spotter-line text-spotter-mute hover:text-white hover:border-white/20 transition">
              Export CSV
            </button>
          </div>

          <ul className="divide-y divide-spotter-line/60">
            {SCANS.map((s) => (
              <li key={s.id} className="px-5 py-4 hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-spotter-line/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.thumb}
                      alt={`${s.make} ${s.model}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-widest text-spotter-mute">
                        {s.year}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded">
                        {s.category}
                      </span>
                      {s.celebrityOwner && (
                        <span className="text-[10px] uppercase tracking-widest bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded">
                          {s.celebrityOwner}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-white truncate">
                      {s.make} {s.model}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-spotter-mute mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {s.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.spottedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                    <div className="text-sm font-semibold">
                      {formatMoney(s.valueLow)}–{formatMoney(s.valueHigh)}
                    </div>
                    <div className="text-[10px] text-spotter-mute uppercase tracking-widest">
                      market value
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1 shrink-0 w-20">
                    <div className="flex items-center gap-1 text-spotter-orange font-semibold text-sm">
                      <Trophy className="w-3.5 h-3.5" />
                      {s.rarity}/10
                    </div>
                    <div className="h-1 rounded-full bg-zinc-800 w-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-spotter-orange to-spotter-red"
                        style={{ width: `${s.rarity * 10}%` }}
                      />
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-spotter-mute shrink-0" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 text-center text-xs text-spotter-mute">
          Data served from <code className="px-1.5 py-0.5 rounded bg-spotter-panel border border-spotter-line">/api/scans</code>,{" "}
          <code className="px-1.5 py-0.5 rounded bg-spotter-panel border border-spotter-line">/api/stats</code>,{" "}
          <code className="px-1.5 py-0.5 rounded bg-spotter-panel border border-spotter-line">/api/spots</code>
        </div>
      </div>
    </main>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
  truncate = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  truncate?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        "rounded-2xl border p-5 " +
        (accent
          ? "border-spotter-orange/30 bg-gradient-to-br from-spotter-orange/10 to-spotter-red/5"
          : "border-spotter-line bg-spotter-panel/50")
      }
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-spotter-mute">{label}</span>
        <Icon className="w-4 h-4 text-spotter-orange" />
      </div>
      <div className={"text-2xl font-semibold " + (truncate ? "truncate" : "")}>{value}</div>
      {sub && <div className="text-xs text-spotter-mute mt-1">{sub}</div>}
    </motion.div>
  );
}
