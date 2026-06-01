// In-memory mock data store. In production this would be Postgres + Stripe + Claude API.
// For the landing-page demo, we serve realistic snapshots so the dashboard feels live.

export type Scan = {
  id: string;
  user: string;
  make: string;
  model: string;
  year: string;
  msrp: number;
  valueLow: number;
  valueHigh: number;
  rarity: number; // 0-10
  category: "Supercar" | "Hypercar" | "Classic" | "Daily" | "JDM" | "Muscle" | "Luxury";
  location: string;
  thumb: string; // unsplash URL
  spottedAt: string; // ISO
  celebrityOwner?: string;
};

export const SCANS: Scan[] = [
  {
    id: "scn_01HXQ1",
    user: "paul@nemapp.com",
    make: "Ferrari",
    model: "SF90 Stradale",
    year: "2022",
    msrp: 507_000,
    valueLow: 550_000,
    valueHigh: 750_000,
    rarity: 8,
    category: "Supercar",
    location: "Rodeo Drive, Beverly Hills",
    thumb: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=80",
    spottedAt: "2026-05-31T14:22:00Z",
    celebrityOwner: "David Beckham",
  },
  {
    id: "scn_01HXQ2",
    user: "paul@nemapp.com",
    make: "Porsche",
    model: "911 GT3 RS (992)",
    year: "2024",
    msrp: 241_300,
    valueLow: 290_000,
    valueHigh: 360_000,
    rarity: 7,
    category: "Supercar",
    location: "Nürburgring touristenfahrten",
    thumb: "https://images.unsplash.com/photo-1611821064430-0d40291922d2?w=400&q=80",
    spottedAt: "2026-05-30T09:14:00Z",
  },
  {
    id: "scn_01HXQ3",
    user: "paul@nemapp.com",
    make: "Bugatti",
    model: "Chiron Pur Sport",
    year: "2021",
    msrp: 3_600_000,
    valueLow: 4_200_000,
    valueHigh: 4_800_000,
    rarity: 10,
    category: "Hypercar",
    location: "Dubai Marina",
    thumb: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80",
    spottedAt: "2026-05-29T22:08:00Z",
    celebrityOwner: "Cristiano Ronaldo",
  },
  {
    id: "scn_01HXQ4",
    user: "paul@nemapp.com",
    make: "Nissan",
    model: "Skyline GT-R R34 V-Spec II",
    year: "2002",
    msrp: 56_000,
    valueLow: 280_000,
    valueHigh: 420_000,
    rarity: 9,
    category: "JDM",
    location: "Daikoku Futō PA, Yokohama",
    thumb: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=400&q=80",
    spottedAt: "2026-05-28T18:42:00Z",
  },
  {
    id: "scn_01HXQ5",
    user: "paul@nemapp.com",
    make: "Mercedes-Benz",
    model: "300SL Gullwing",
    year: "1955",
    msrp: 7_500,
    valueLow: 1_400_000,
    valueHigh: 1_800_000,
    rarity: 10,
    category: "Classic",
    location: "Pebble Beach Concours",
    thumb: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",
    spottedAt: "2026-05-27T11:30:00Z",
  },
  {
    id: "scn_01HXQ6",
    user: "paul@nemapp.com",
    make: "Lamborghini",
    model: "Huracán Sterrato",
    year: "2024",
    msrp: 273_000,
    valueLow: 290_000,
    valueHigh: 330_000,
    rarity: 7,
    category: "Supercar",
    location: "Aspen Mountain Village",
    thumb: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80",
    spottedAt: "2026-05-26T16:05:00Z",
  },
  {
    id: "scn_01HXQ7",
    user: "paul@nemapp.com",
    make: "Aston Martin",
    model: "Valkyrie",
    year: "2023",
    msrp: 3_000_000,
    valueLow: 3_400_000,
    valueHigh: 3_900_000,
    rarity: 10,
    category: "Hypercar",
    location: "Berkeley Square, Mayfair",
    thumb: "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=400&q=80",
    spottedAt: "2026-05-25T15:12:00Z",
  },
  {
    id: "scn_01HXQ8",
    user: "paul@nemapp.com",
    make: "BMW",
    model: "M3 E30 Sport Evolution",
    year: "1990",
    msrp: 53_000,
    valueLow: 220_000,
    valueHigh: 310_000,
    rarity: 9,
    category: "Classic",
    location: "Bring a Trailer pickup, SF",
    thumb: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&q=80",
    spottedAt: "2026-05-24T10:48:00Z",
  },
  {
    id: "scn_01HXQ9",
    user: "paul@nemapp.com",
    make: "McLaren",
    model: "F1",
    year: "1995",
    msrp: 815_000,
    valueLow: 20_000_000,
    valueHigh: 25_000_000,
    rarity: 10,
    category: "Hypercar",
    location: "Goodwood Festival of Speed",
    thumb: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80",
    spottedAt: "2026-05-23T13:00:00Z",
    celebrityOwner: "Rowan Atkinson (prev.)",
  },
  {
    id: "scn_01HXQA",
    user: "paul@nemapp.com",
    make: "Pagani",
    model: "Huayra Roadster BC",
    year: "2020",
    msrp: 3_500_000,
    valueLow: 4_100_000,
    valueHigh: 4_900_000,
    rarity: 10,
    category: "Hypercar",
    location: "Casino Square, Monte Carlo",
    thumb: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400&q=80",
    spottedAt: "2026-05-22T20:35:00Z",
  },
];

export type UsageRow = {
  day: string; // YYYY-MM-DD
  scans: number;
};

// 14 days of synthetic activity for the dashboard chart
export const USAGE: UsageRow[] = [
  { day: "2026-05-19", scans: 18 },
  { day: "2026-05-20", scans: 24 },
  { day: "2026-05-21", scans: 31 },
  { day: "2026-05-22", scans: 19 },
  { day: "2026-05-23", scans: 42 },
  { day: "2026-05-24", scans: 27 },
  { day: "2026-05-25", scans: 33 },
  { day: "2026-05-26", scans: 38 },
  { day: "2026-05-27", scans: 51 },
  { day: "2026-05-28", scans: 44 },
  { day: "2026-05-29", scans: 39 },
  { day: "2026-05-30", scans: 46 },
  { day: "2026-05-31", scans: 28 },
  { day: "2026-06-01", scans: 12 },
];

export function aggregateStats() {
  const totalScans = SCANS.length;
  const portfolioValueLow = SCANS.reduce((a, s) => a + s.valueLow, 0);
  const portfolioValueHigh = SCANS.reduce((a, s) => a + s.valueHigh, 0);
  const rarest = [...SCANS].sort((a, b) => b.rarity - a.rarity)[0];
  const byCategory = SCANS.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});
  return {
    totalScans,
    portfolioValueLow,
    portfolioValueHigh,
    rarestId: rarest?.id,
    rarestLabel: rarest ? `${rarest.year} ${rarest.make} ${rarest.model}` : null,
    byCategory,
    last14Days: USAGE,
  };
}
