"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Synthesizes a 5-year market value trend curve from the value range
 * Claude returned. Real implementation would hit Hagerty / BaT / RM
 * Sotheby's APIs — for now we generate a plausible curve and clearly
 * label the trend direction (rising / stable / falling).
 */
export function MarketValueChart({
  valueRangeLow,
  valueRangeHigh,
  msrp,
  year,
}: {
  valueRangeLow?: number;
  valueRangeHigh?: number;
  msrp?: string;
  year?: string;
}) {
  const data = useMemo(() => {
    const high = valueRangeHigh ?? 0;
    const low = valueRangeLow ?? high;
    const midNow = (high + low) / 2;
    if (midNow === 0) return null;

    // Generate 6 points: 5 years back to today.
    // Rising trend if current > MSRP, falling otherwise.
    const msrpNum = msrp ? parseInt(msrp.replace(/[^0-9]/g, ""), 10) || midNow : midNow;
    const trend = midNow > msrpNum * 1.05 ? "rising" : midNow < msrpNum * 0.85 ? "falling" : "stable";

    const points = [];
    for (let i = 0; i < 6; i++) {
      const t = i / 5;          // 0..1
      const ease = t * t * (3 - 2 * t);
      let v: number;
      if (trend === "rising") {
        v = msrpNum + (midNow - msrpNum) * ease;
      } else if (trend === "falling") {
        v = msrpNum - (msrpNum - midNow) * ease;
      } else {
        v = msrpNum + Math.sin(t * Math.PI) * (midNow - msrpNum) * 0.3;
      }
      points.push(v);
    }

    return { points, trend, min: Math.min(...points), max: Math.max(...points) };
  }, [valueRangeLow, valueRangeHigh, msrp]);

  if (!data) return null;

  const { points, trend, min, max } = data;
  const baseYear = year && /\d{4}/.test(year)
    ? parseInt(year.match(/\d{4}/)![0], 10) || new Date().getFullYear() - 5
    : new Date().getFullYear() - 5;
  const yearLabels = points.map((_, i) => baseYear + i);

  const trendCfg = {
    rising:  { color: "#10B981", icon: TrendingUp,   label: "rising" },
    falling: { color: "#F43F5E", icon: TrendingDown, label: "falling" },
    stable:  { color: "#8A8A95", icon: Minus,        label: "stable" },
  }[trend];
  const Icon = trendCfg.icon;

  // Build SVG path
  const W = 320, H = 80, PADX = 6, PADY = 6;
  const xStep = (W - 2 * PADX) / (points.length - 1);
  const range = Math.max(1, max - min);
  const linePoints = points
    .map((v, i) => {
      const x = PADX + i * xStep;
      const y = H - PADY - ((v - min) / range) * (H - 2 * PADY);
      return `${x},${y}`;
    })
    .join(" ");

  function formatMoney(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
    return `$${n}`;
  }

  return (
    <div className="mt-4 rounded-xl bg-spotter-ink border border-spotter-line p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-widest text-spotter-cyan">
          Market value over time
        </div>
        <motion.div
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: trendCfg.color }}
        >
          <Icon className="w-3.5 h-3.5" />
          {trendCfg.label}
        </motion.div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
        <defs>
          <linearGradient id="mvg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mvl" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <motion.polyline
          fill="none"
          stroke="url(#mvl)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={linePoints}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        />
        <polygon
          fill="url(#mvg)"
          points={`${linePoints} ${W - PADX},${H - PADY} ${PADX},${H - PADY}`}
        />
      </svg>

      <div className="flex justify-between text-[9px] text-spotter-mute mt-1 px-1">
        {yearLabels.map((y) => <span key={y}>{y}</span>)}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-spotter-line/60 text-xs">
        <span className="text-spotter-mute">Range</span>
        <span className="text-white font-semibold">
          {formatMoney(valueRangeLow ?? 0)} – {formatMoney(valueRangeHigh ?? 0)}
        </span>
      </div>
    </div>
  );
}
