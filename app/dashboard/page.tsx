"use client";

import { Suspense, useEffect, useState } from "react";
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
import { PostCheckoutSync } from "../../components/PostCheckoutSync";
import { RecoverSubscription } from "../../components/RecoverSubscription";
import { DashboardMap } from "../../components/DashboardMap";
import { useAuth } from "../../components/AuthProvider";
import { subscribeToMyScans, aggregateMyStats, type UserScan } from "../../lib/firestoreClient";
import { getUserProfile, type UserProfile } from "../../lib/firebase";

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export default function DashboardPage() {
  const { user, loading: authLoading, configured } = useAuth();
  const [scans, setScans] = useState<UserScan[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMyScans(user.uid, setScans);
    return () => { unsub?.(); };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((p) => setProfile(p));
  }, [user]);

  const stats = aggregateMyStats(scans);
  const maxUsage = Math.max(1, ...stats.last14Days.map((u) => u.scans));
  const totalUsage = stats.last14Days.reduce((a, b) => a + b.scans, 0);
  const categoryEntries = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);
  const totalCats = categoryEntries.reduce((a, [, v]) => a + v, 0);

  if (configured && !authLoading && !user) {
    return (
      <main className="min-h-screen bg-spotter-ink text-white grid place-items-center px-4">
        <div className="bg-spotter-panel border border-spotter-line rounded-2xl p-8 max-w-sm w-full text-center">
          <Crown className="w-8 h-8 text-spotter-cyan mx-auto mb-3" />
          <h1 className="text-2xl font-semibold mb-2">Sign in to see your garage</h1>
          <p className="text-sm text-spotter-mute mb-5">
            Your dashboard syncs across every device once you're signed in.
          </p>
          <Link
            href="/signin?next=/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition text-sm"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const planLabel = profile?.plan ?? "free";

  return (
    <main className="min-h-screen bg-spotter-ink text-white">
      <Suspense fallback={null}>
        <PostCheckoutSync />
      </Suspense>

      <header className="sticky top-0 z-40 backdrop-blur-md bg-spotter-ink/80 border-b border-spotter-line">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-spotter-mute hover:text-white transition flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="h-5 w-px bg-spotter-line" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-spotter-cyan to-spotter-violet grid place-items-center">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold tracking-tight">CarSpotter</span>
              <span className="text-xs text-spotter-mute">/ Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {planLabel !== "free" ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-spotter-cyan/30 bg-spotter-cyan/10 text-xs text-spotter-cyan font-semibold capitalize">
                <Crown className="w-3.5 h-3.5" />
                {planLabel}
              </div>
            ) : (
              <Link
                href="/#pricing"
                className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 font-semibold hover:brightness-110 transition"
              >
                <Crown className="w-3.5 h-3.5" /> Upgrade
              </Link>
            )}
            <Link
              href="/scan"
              className="bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:brightness-110 transition"
            >
              New scan
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-10">
        {planLabel === "free" && <RecoverSubscription />}

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-spotter-cyan mb-2">Your activity</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Welcome back, <span className="gradient-text">{user?.displayName ?? user?.email?.split("@")[0] ?? "spotter"}</span>
          </h1>
          <p className="text-spotter-mute text-sm mt-2">
            {totalUsage.toLocaleString()} scans in the last 14 days · {stats.totalScans} cars in your collection
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Kpi icon={Activity} label="Total scans" value={stats.totalScans.toString()} sub="lifetime" />
          <Kpi
            icon={TrendingUp}
            label="Portfolio value"
            value={stats.portfolioValueLow ? formatMoney(stats.portfolioValueLow) : "—"}
            sub={stats.portfolioValueHigh ? `to ${formatMoney(stats.portfolioValueHigh)}` : "scan some cars"}
            accent
          />
          <Kpi
            icon={Star}
            label="Rarest spotted"
            value={stats.rarestLabel ?? "—"}
            sub={stats.rarestLabel ? "your top find" : "all yours to discover"}
            truncate
          />
          <Kpi
            icon={Crown}
            label="Plan"
            value={planLabel === "free" ? "Free" : planLabel.charAt(0).toUpperCase() + planLabel.slice(1)}
            sub={planLabel === "free" ? "3 free scans" : "unlimited"}
          />
        </div>

        {/* Personal Spot Map (paid users) or upsell card (free users) */}
        <DashboardMap scans={scans} plan={planLabel} />

        {scans.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-4 mb-8">
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
                </div>
                <div className="h-44 flex items-end gap-1.5">
                  {stats.last14Days.map((u, i) => {
                    const h = (u.scans / maxUsage) * 100;
                    return (
                      <div key={u.day} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(2, h)}%` }}
                          transition={{ delay: i * 0.03, duration: 0.5, ease: "easeOut" }}
                          className="w-full rounded-t-md bg-gradient-to-t from-spotter-cyan to-spotter-violet"
                          title={`${u.day}: ${u.scans} scans`}
                        />
                        <span className="text-[9px] text-spotter-mute">{u.day.slice(8, 10)}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-spotter-line bg-spotter-panel/50 p-5"
              >
                <div className="text-xs uppercase tracking-widest text-spotter-mute mb-1">Collection by category</div>
                <div className="text-xl font-semibold mb-4">{stats.totalScans} cars</div>
                {categoryEntries.length === 0 ? (
                  <p className="text-sm text-spotter-mute italic">Categories appear once you've scanned.</p>
                ) : (
                  <ul className="space-y-3">
                    {categoryEntries.map(([cat, count], i) => {
                      const pct = (count / Math.max(1, totalCats)) * 100;
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
                              className="h-full bg-gradient-to-r from-spotter-cyan to-spotter-violet"
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            </div>

            <div className="rounded-2xl border border-spotter-line bg-spotter-panel/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-spotter-line">
                <div className="text-xs uppercase tracking-widest text-spotter-mute">Scan history</div>
                <div className="text-lg font-semibold">Your spots</div>
              </div>
              <ul className="divide-y divide-spotter-line/60">
                {scans.map((s) => (
                  <li key={s.id} className="px-5 py-4 hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-spotter-line/60">
                        {s.thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.thumb} alt={`${s.make} ${s.model}`} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-spotter-mute">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase tracking-widest text-spotter-mute">{s.year}</span>
                          <span className="text-[10px] uppercase tracking-widest bg-blue-500/15 text-blue-300 px-1.5 py-0.5 rounded">{s.category}</span>
                          {s.celebrity && (
                            <span className="text-[10px] uppercase tracking-widest bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded">{s.celebrity}</span>
                          )}
                        </div>
                        <div className="font-semibold text-white truncate">{s.make} {s.model}</div>
                        <div className="flex items-center gap-3 text-xs text-spotter-mute mt-0.5">
                          {s.location && (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.location}</span>
                          )}
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {s.spottedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                        <div className="text-sm font-semibold">{s.valueRange || "—"}</div>
                        <div className="text-[10px] text-spotter-mute uppercase tracking-widest">market value</div>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-1 shrink-0 w-20">
                        <div className="flex items-center gap-1 text-spotter-cyan font-semibold text-sm">
                          <Trophy className="w-3.5 h-3.5" /> {s.rarity}/10
                        </div>
                        <div className="h-1 rounded-full bg-zinc-800 w-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-spotter-cyan to-spotter-violet" style={{ width: `${s.rarity * 10}%` }} />
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-spotter-mute shrink-0" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-spotter-line bg-spotter-panel/50 p-12 text-center">
      <Camera className="w-12 h-12 text-spotter-cyan mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Your garage is empty</h2>
      <p className="text-sm text-spotter-mute mb-6 max-w-sm mx-auto">
        Scan your first car to start your collection. Every spot syncs across all your devices.
      </p>
      <Link
        href="/scan"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition text-sm"
      >
        <Camera className="w-4 h-4" /> Snap your first car
      </Link>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, accent = false, truncate = false }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub?: string; accent?: boolean; truncate?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        "rounded-2xl border p-5 " +
        (accent
          ? "border-spotter-cyan/30 bg-gradient-to-br from-spotter-cyan/10 to-spotter-violet/5"
          : "border-spotter-line bg-spotter-panel/50")
      }
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-spotter-mute">{label}</span>
        <Icon className="w-4 h-4 text-spotter-cyan" />
      </div>
      <div className={"text-2xl font-semibold " + (truncate ? "truncate" : "")}>{value}</div>
      {sub && <div className="text-xs text-spotter-mute mt-1">{sub}</div>}
    </motion.div>
  );
}
