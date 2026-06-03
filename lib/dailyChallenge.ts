/**
 * Deterministic daily challenge — rotates every 24h based on UTC day.
 * Same challenge for all users on the same calendar day, so a global
 * leaderboard / "Spot of the Day" makes sense without server state.
 */

export type Challenge = {
  id: string;
  emoji: string;
  title: string;          // short imperative — "Spot a red Italian car"
  hint: string;           // 1-line explainer
  pointsMultiplier: number; // bonus for any car matching today's vibe
  difficulty: "easy" | "medium" | "hard" | "legendary";
};

const POOL: Omit<Challenge, "id">[] = [
  { emoji: "🚗", title: "Spot a red Italian car",         hint: "Ferraris, Lambos, Alfas, Paganis — anything red and Italian counts.", pointsMultiplier: 1.5, difficulty: "easy" },
  { emoji: "🇩🇪", title: "Find a German performance car", hint: "M, AMG, RS, GT3 badge required.",                                        pointsMultiplier: 1.5, difficulty: "easy" },
  { emoji: "🇯🇵", title: "Catch a JDM legend",            hint: "R32-R35 GT-R, Supra, RX-7, NSX, Lancer Evo all count.",                pointsMultiplier: 2.0, difficulty: "medium" },
  { emoji: "🛻", title: "Snap a vintage truck",            hint: "Pre-1990 Ford, Chevy, Toyota Hilux, or Land Cruiser.",                  pointsMultiplier: 1.8, difficulty: "medium" },
  { emoji: "👑", title: "Spot a Rolls Royce in the wild",  hint: "Phantom, Cullinan, Ghost, or anything with the Spirit of Ecstasy.",     pointsMultiplier: 2.5, difficulty: "medium" },
  { emoji: "🏎️", title: "Find a real hypercar (≥$1M)",    hint: "Bugatti, Pagani, Koenigsegg, Aston Valkyrie, McLaren P1/F1, LaFerrari.", pointsMultiplier: 5.0, difficulty: "legendary" },
  { emoji: "🐎", title: "Spot a prancing horse",            hint: "Any Ferrari — yes, even the Purosangue counts.",                       pointsMultiplier: 1.8, difficulty: "medium" },
  { emoji: "🟡", title: "Find a yellow Lambo",              hint: "Yellow Aventador, Huracán, Urus, Revuelto — all qualify.",             pointsMultiplier: 2.0, difficulty: "medium" },
  { emoji: "🛞", title: "Spot a Porsche 911 (any year)",    hint: "1964 to 2026 — any 911 generation counts.",                            pointsMultiplier: 1.2, difficulty: "easy" },
  { emoji: "🌬️", title: "Spot an air-cooled 911",          hint: "Pre-1998 Porsche 911 — the holy grail for purists.",                   pointsMultiplier: 3.5, difficulty: "hard" },
  { emoji: "🚙", title: "Find a G-Wagon",                   hint: "Mercedes G63, G500, or a 1980s 460-chassis classic.",                  pointsMultiplier: 1.5, difficulty: "easy" },
  { emoji: "⚡", title: "Snap a high-end EV",               hint: "Tesla Roadster, Lucid Air Sapphire, Rimac, Taycan Turbo S.",            pointsMultiplier: 2.0, difficulty: "medium" },
  { emoji: "🏁", title: "Find a manual-transmission car",   hint: "Any sports car that still has three pedals.",                          pointsMultiplier: 2.2, difficulty: "medium" },
  { emoji: "🇬🇧", title: "Catch a British icon",            hint: "Aston Martin, Jaguar, McLaren, Lotus, Bentley, Mini Cooper S.",         pointsMultiplier: 1.8, difficulty: "medium" },
  { emoji: "🎩", title: "Find a 1950s classic",             hint: "300SL Gullwing, MG, T-Bird, Bel Air, Caddy Eldorado.",                  pointsMultiplier: 3.0, difficulty: "hard" },
  { emoji: "🏎", title: "Spot a one-of-one or one-off",     hint: "Bespoke build, Q-by-Aston, Pagani Codalunga, Bugatti VNN.",             pointsMultiplier: 10,  difficulty: "legendary" },
  { emoji: "💎", title: "Find a chrome wrap",                hint: "Mirror or chrome-wrapped wrap of any supercar — Dubai-spec.",            pointsMultiplier: 2.0, difficulty: "medium" },
  { emoji: "🔥", title: "Find a wagon (yes a wagon)",        hint: "Audi RS6 Avant, M3 Touring, Volvo V70R, Cayenne… well, no.",            pointsMultiplier: 2.5, difficulty: "hard" },
];

/** Day index since a fixed epoch (Jan 1 2025 UTC). Stable across timezones. */
function dayIndex(date = new Date()): number {
  const epoch = Date.UTC(2025, 0, 1);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((today - epoch) / (24 * 60 * 60 * 1000));
}

export function todaysChallenge(date = new Date()): Challenge {
  const idx = dayIndex(date);
  const item = POOL[((idx % POOL.length) + POOL.length) % POOL.length];
  return {
    ...item,
    id: `daily-${date.toISOString().slice(0, 10)}`,
  };
}

export function challengeStreak(consecutiveDays: number): number {
  if (consecutiveDays < 2) return 1.0;
  return 1.0 + Math.min(consecutiveDays - 1, 6) * 0.1; // +10% per day, capped at +60%
}
