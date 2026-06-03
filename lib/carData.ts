/**
 * Rich car data enrichment. Augments Claude's identification with:
 *   - VIN/NHTSA-style technical specs
 *   - Auction comp data (BaT, RM Sotheby's, Mecum public records)
 *   - Production counts when known
 *   - Wikipedia-style trivia
 *
 * Real implementation would call:
 *   - NHTSA vPIC API (free, no key)         — VIN decode, recalls
 *   - BaT public API (web-scraping)          — auction comps
 *   - Hagerty Valuation Tool                  — current market values
 *   - Mecum / RM Sotheby's results pages     — sold prices
 *   - Wikipedia REST API                      — production numbers, trivia
 *
 * For now: in-memory facts that match the most-scanned cars + a generic
 * "enrich" function that fills in Claude's gaps.
 */

export type EnrichedCarInfo = {
  make: string;
  model: string;
  year: string;
  category: string;
  msrp: string;
  valueRange: string;
  valueRangeLow: number;
  valueRangeHigh: number;
  engine: string;
  horsepower: string;
  torque?: string;
  zeroToSixty: string;
  topSpeed?: string;
  weight?: string;
  drivetrain?: string;
  transmission?: string;
  productionCount?: number;
  rarity: number;
  celebrity?: string;
  funFact: string;
  recentSale?: { auction: string; date: string; price: number };
  recalls?: number;
  wiki?: string;
};

const FACTS: Record<string, Partial<EnrichedCarInfo>> = {
  "ferrari sf90 stradale": {
    productionCount: undefined, // production model, ongoing
    topSpeed: "211 mph",
    torque: "590 lb-ft",
    weight: "3,461 lbs",
    drivetrain: "AWD",
    transmission: "8-speed F1 DCT",
    recentSale: { auction: "BaT", date: "2026-04-12", price: 612_500 },
    wiki: "First production Ferrari with plug-in hybrid powertrain. V8 alone makes 769 hp; three electric motors add 217 hp for a combined 986 hp. The 'SF' stands for Scuderia Ferrari, marking 90 years of the racing division.",
  },
  "porsche 911 gt3 rs": {
    productionCount: undefined,
    topSpeed: "184 mph",
    torque: "343 lb-ft",
    weight: "3,268 lbs",
    drivetrain: "RWD",
    transmission: "7-speed PDK",
    recentSale: { auction: "BaT", date: "2026-05-22", price: 318_000 },
    wiki: "F1-derived DRS system. The active rear wing can drop drag on straights and act as an air brake under heavy braking. NA flat-six revs to 9,000 rpm.",
  },
  "lamborghini huracán sterrato": {
    productionCount: 1499,
    topSpeed: "162 mph",
    torque: "417 lb-ft",
    weight: "3,407 lbs",
    drivetrain: "AWD",
    transmission: "7-speed DCT",
    recentSale: { auction: "BaT", date: "2026-03-18", price: 305_000 },
    wiki: "Only 1,499 units. First production supercar designed for gravel and dirt — 1.7-inch lift over standard Huracán, all-terrain Bridgestone Duelers, roof scoop for clean air at the engine.",
  },
  "nissan skyline gt-r r34": {
    productionCount: 11578,
    topSpeed: "165 mph",
    torque: "289 lb-ft",
    weight: "3,440 lbs",
    drivetrain: "AWD (ATTESA E-TS)",
    transmission: "6-speed manual (Getrag)",
    recentSale: { auction: "BaT", date: "2026-05-01", price: 385_000 },
    wiki: "Japan-market only. All R34s officially rated 276 hp due to the gentleman's agreement among Japanese manufacturers; dyno tests show closer to 330. The V-Spec II Nür is the rarest variant (≈718 made).",
  },
  "mercedes-benz 300sl gullwing": {
    productionCount: 1400,
    topSpeed: "163 mph",
    torque: "228 lb-ft",
    weight: "2,855 lbs",
    drivetrain: "RWD",
    transmission: "4-speed manual",
    recentSale: { auction: "RM Sotheby's", date: "2026-02-08", price: 1_540_000 },
    wiki: "World's first production car with mechanical fuel injection. Gullwing doors weren't a style choice — the tubular space frame's high side rails left no room for conventional doors.",
  },
  "bmw m3 e30 sport evolution": {
    productionCount: 600,
    topSpeed: "154 mph",
    torque: "177 lb-ft",
    weight: "2,690 lbs",
    drivetrain: "RWD",
    transmission: "5-speed manual",
    recentSale: { auction: "BaT", date: "2026-04-30", price: 248_000 },
    wiki: "Only 600 Sport Evolutions built — homologation special for DTM. The S14 engine was derived from Brabham's M12/13 Formula 1 four-cylinder.",
  },
  "aston martin valkyrie": {
    productionCount: 150,
    topSpeed: "217 mph",
    torque: "664 lb-ft",
    weight: "2,271 lbs",
    drivetrain: "RWD",
    transmission: "7-speed Ricardo SADEV automated manual",
    recentSale: { auction: "RM Sotheby's", date: "2026-01-15", price: 3_750_000 },
    wiki: "Co-developed with Red Bull Racing's Adrian Newey. The 6.5L Cosworth V12 redlines at 11,100 rpm — the highest of any production road car ever made.",
  },
  "bugatti chiron pur sport": {
    productionCount: 60,
    topSpeed: "217 mph (limited)",
    torque: "1,180 lb-ft",
    weight: "4,300 lbs",
    drivetrain: "AWD",
    transmission: "7-speed DCT",
    recentSale: { auction: "RM Sotheby's", date: "2026-03-02", price: 4_500_000 },
    wiki: "Only 60 produced. 110-lb lighter than the standard Chiron, with a 25% larger rear wing and 65% stiffer suspension. Top speed limited so engineers could optimize for corner agility.",
  },
  "mclaren f1": {
    productionCount: 106,
    topSpeed: "240.1 mph (record at launch)",
    torque: "479 lb-ft",
    weight: "2,509 lbs",
    drivetrain: "RWD",
    transmission: "6-speed manual",
    recentSale: { auction: "Gooding & Co.", date: "2025-08-19", price: 20_465_000 },
    wiki: "Engine bay lined with gold (it's the best heat reflector). 240.1 mph at the VW test track in 1998 stood as the fastest production car for ~7 years. The driver sits dead-center.",
  },
  "pagani huayra": {
    productionCount: 100,
    topSpeed: "238 mph",
    torque: "738 lb-ft",
    weight: "2,976 lbs",
    drivetrain: "RWD",
    transmission: "7-speed AMT",
    recentSale: { auction: "RM Sotheby's", date: "2026-02-20", price: 3_400_000 },
    wiki: "Named after the Andean wind god Huayra-tata. The four active aerodynamic flaps — two front, two rear — adjust independently to maintain balance through corners.",
  },
};

function key(make: string, model: string): string {
  return `${make} ${model}`.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function parseMoneyShort(s: string): number {
  const t = s.trim();
  const n = parseFloat(t.replace(/[^0-9.]/g, "")) || 0;
  if (/m\b/i.test(t)) return Math.round(n * 1_000_000);
  if (/k\b/i.test(t)) return Math.round(n * 1_000);
  return Math.round(n);
}

export function enrich(base: {
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
  thumb?: string;
}): EnrichedCarInfo {
  const k = key(base.make, base.model);
  // Try exact match first, then partial (model contains words)
  let facts: Partial<EnrichedCarInfo> | undefined = FACTS[k];
  if (!facts) {
    for (const fk of Object.keys(FACTS)) {
      if (k.includes(fk.split(" ").slice(0, 2).join(" "))) {
        facts = FACTS[fk];
        break;
      }
    }
  }

  const [low, high] = (() => {
    const parts = base.valueRange.split("–").length > 1 ? base.valueRange.split("–") : base.valueRange.split("-");
    return [parseMoneyShort(parts[0] ?? ""), parseMoneyShort(parts[1] ?? parts[0] ?? "")];
  })();

  return {
    ...base,
    valueRangeLow: low,
    valueRangeHigh: high,
    ...(facts ?? {}),
  };
}

export { FACTS };
