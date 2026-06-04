"use client";

import {
  collection,
  query,
  where,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserScan = {
  id: string;
  make: string;
  model: string;
  year: string;
  category: string;
  msrp: string;
  valueRange: string;
  valueRangeLow?: number;
  valueRangeHigh?: number;
  rarity: number;
  celebrity?: string;
  funFact?: string;
  thumb?: string;
  location?: string;
  spottedAt: Date;
};

function parseMoneyShort(s: string): number {
  if (!s) return 0;
  const t = s.trim();
  const n = parseFloat(t.replace(/[^0-9.]/g, "")) || 0;
  if (/m\b/i.test(t)) return Math.round(n * 1_000_000);
  if (/k\b/i.test(t)) return Math.round(n * 1_000);
  return Math.round(n);
}

/**
 * Live-subscribe to /scans for one user, sorted newest first.
 * Returns the unsubscribe fn to clean up on unmount.
 */
export function subscribeToMyScans(
  userId: string,
  cb: (scans: UserScan[]) => void,
  max = 100,
): Unsubscribe | null {
  const f = db();
  if (!f) {
    cb([]);
    return null;
  }
  const q = query(
    collection(f, "scans"),
    where("userId", "==", userId),
    orderBy("spottedAt", "desc"),
    fbLimit(max),
  );
  return onSnapshot(q, (snap) => {
    const scans = snap.docs.map((d) => {
      const data = d.data();
      const valueRange = data.valueRange ?? "";
      const [lowStr, highStr] = (valueRange.split("–").length > 1
        ? valueRange.split("–")
        : valueRange.split("-"))
        .map((s: string) => s.trim());

      return {
        id: d.id,
        make: data.make ?? "Unknown",
        model: data.model ?? "Unknown",
        year: data.year ?? "",
        category: data.category ?? "Daily",
        msrp: data.msrp ?? "—",
        valueRange,
        valueRangeLow: data.valueRangeLow ?? parseMoneyShort(lowStr),
        valueRangeHigh: data.valueRangeHigh ?? parseMoneyShort(highStr ?? lowStr),
        rarity: typeof data.rarity === "number" ? data.rarity : 5,
        celebrity: data.celebrity,
        funFact: data.funFact,
        thumb: data.thumb,
        location: data.location,
        spottedAt: data.spottedAt?.toDate?.() ?? new Date(),
      } as UserScan;
    });
    cb(scans);
  });
}

/** Build dashboard-ready stats from a list of user scans. */
export function aggregateMyStats(scans: UserScan[]) {
  const totalScans = scans.length;
  const portfolioValueLow = scans.reduce((a, s) => a + (s.valueRangeLow ?? 0), 0);
  const portfolioValueHigh = scans.reduce((a, s) => a + (s.valueRangeHigh ?? 0), 0);
  const rarest = scans.length
    ? scans.slice().sort((a, b) => b.rarity - a.rarity)[0]
    : null;
  const byCategory = scans.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});

  // Bucket by day for the last 14 days chart
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getTime() - (13 - i) * 86_400_000);
    return d.toISOString().slice(0, 10);
  });
  const dayMap: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));
  for (const s of scans) {
    const key = s.spottedAt.toISOString().slice(0, 10);
    if (key in dayMap) dayMap[key]++;
  }
  const last14Days = days.map((day) => ({ day, scans: dayMap[day] }));

  return {
    totalScans,
    portfolioValueLow,
    portfolioValueHigh,
    rarestId: rarest?.id ?? null,
    rarestLabel: rarest ? `${rarest.year} ${rarest.make} ${rarest.model}` : null,
    byCategory,
    last14Days,
  };
}
