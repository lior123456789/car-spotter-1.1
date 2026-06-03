"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, ArrowRight, Loader2 } from "lucide-react";

type Challenge = {
  id: string;
  emoji: string;
  title: string;
  hint: string;
  pointsMultiplier: number;
  difficulty: "easy" | "medium" | "hard" | "legendary";
};

const DIFFICULTY: Record<Challenge["difficulty"], { label: string; color: string }> = {
  easy:       { label: "Easy",       color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  medium:     { label: "Medium",     color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  hard:       { label: "Hard",       color: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
  legendary:  { label: "Legendary",  color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
};

function useCountdownToMidnight(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const ms = midnight.getTime() - now.getTime();
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DailyChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const countdown = useCountdownToMidnight();

  useEffect(() => {
    fetch("/api/daily", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setChallenge(d.challenge))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="daily" className="relative bg-spotter-ink py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-spotter-cyan/40 bg-spotter-cyan/10 text-xs text-spotter-cyan mb-4">
            <Flame className="w-3.5 h-3.5" />
            Updates every 24h · global challenge
          </div>
          <p className="text-sm uppercase tracking-[0.24em] text-spotter-cyan mb-3">Today's mission</p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
            Daily <span className="gradient-text">spot challenge</span>.
          </h2>
          <p className="text-spotter-mute max-w-xl mx-auto mt-4">
            Catch the car of the day and earn a points multiplier. Resets at midnight UTC.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden border border-spotter-line bg-gradient-to-br from-spotter-panel via-spotter-ink to-spotter-panel shadow-2xl"
        >
          {/* glow */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 10% 0%, rgba(34,211,238,0.30), transparent 60%)," +
                "radial-gradient(ellipse 70% 60% at 90% 100%, rgba(168,85,247,0.25), transparent 60%)",
            }}
          />

          {loading || !challenge ? (
            <div className="h-64 grid place-items-center text-spotter-mute">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="relative grid md:grid-cols-[1fr_auto] gap-6 p-7 md:p-10 items-center">
              {/* LEFT */}
              <div className="flex items-start gap-5 min-w-0">
                <div className="text-6xl md:text-7xl select-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                  {challenge.emoji}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-widest font-semibold " + DIFFICULTY[challenge.difficulty].color}>
                      {DIFFICULTY[challenge.difficulty].label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-spotter-violet/30 bg-spotter-violet/10 text-[10px] uppercase tracking-widest font-semibold text-spotter-violet">
                      <Trophy className="w-3 h-3" />
                      {challenge.pointsMultiplier}× points
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold leading-tight mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-spotter-mute leading-relaxed">{challenge.hint}</p>
                </div>
              </div>

              {/* RIGHT — countdown + CTA */}
              <div className="flex flex-col items-stretch gap-3 md:items-end">
                <div className="text-center md:text-right">
                  <div className="text-[10px] uppercase tracking-widest text-spotter-mute mb-1">Time left</div>
                  <div className="font-mono text-2xl md:text-3xl font-semibold gradient-text tabular-nums">
                    {countdown}
                  </div>
                </div>
                <a
                  href="/scan"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-spotter-cyan/30 hover:brightness-110 transition text-sm"
                >
                  Start hunting <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
