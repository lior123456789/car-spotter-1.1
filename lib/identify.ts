/**
 * Car identification.
 *   - If ANTHROPIC_API_KEY is set: real call to Claude with vision (claude-opus-4-7)
 *   - Otherwise: returns a randomized mock so the demo still works.
 */

export type IdentifyResult = {
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
  confidence?: number;
  source: "claude" | "mock";
};

const MOCK_POOL: IdentifyResult[] = [
  { make: "Ferrari", model: "SF90 Stradale", year: "2020–2023", category: "Supercar", msrp: "$507,000", valueRange: "$550k – $750k", engine: "4.0L Twin-Turbo V8 PHEV", horsepower: "986 hp", zeroToSixty: "2.5 s", rarity: 8, celebrity: "David Beckham", funFact: "First production Ferrari to use a plug-in hybrid powertrain — the V8 alone makes 769 hp.", source: "mock" },
  { make: "Porsche", model: "911 GT3 RS (992)", year: "2023–2024", category: "Supercar", msrp: "$241,300", valueRange: "$290k – $360k", engine: "4.0L NA Flat-Six", horsepower: "518 hp", zeroToSixty: "3.0 s", rarity: 7, funFact: "DRS system borrowed from F1 — the rear wing can flatten itself mid-corner to keep top speed up.", source: "mock" },
  { make: "Lamborghini", model: "Huracán Sterrato", year: "2023–2024", category: "Supercar", msrp: "$273,000", valueRange: "$290k – $330k", engine: "5.2L NA V10", horsepower: "602 hp", zeroToSixty: "3.4 s", rarity: 7, funFact: "First production supercar designed for gravel and dirt — 1.7-inch lift, rally tires, roof scoop.", source: "mock" },
  { make: "Nissan", model: "Skyline GT-R R34 V-Spec II", year: "2000–2002", category: "JDM Legend", msrp: "$56,000 (original)", valueRange: "$280k – $420k", engine: "2.6L Twin-Turbo I6 (RB26DETT)", horsepower: "276 hp (claimed) · ~330 actual", zeroToSixty: "4.9 s", rarity: 9, funFact: "All Japan-market R34s were officially rated at 276 hp due to the 'gentleman's agreement' — most made closer to 330.", source: "mock" },
  { make: "Mercedes-Benz", model: "300SL Gullwing", year: "1954–1957", category: "Classic", msrp: "$7,500 (1955)", valueRange: "$1.4M – $1.8M", engine: "3.0L Inline-6 (M198)", horsepower: "215 hp", zeroToSixty: "8.8 s", rarity: 10, celebrity: "Clark Gable", funFact: "World's first production car with fuel injection. The gullwing doors weren't a styling choice — the tubular space frame left no room for normal doors.", source: "mock" },
  { make: "BMW", model: "M3 E30 Sport Evolution", year: "1990", category: "Classic", msrp: "$53,000 (1990)", valueRange: "$220k – $310k", engine: "2.5L NA Inline-4 (S14)", horsepower: "238 hp", zeroToSixty: "6.1 s", rarity: 9, funFact: "Only 600 Sport Evolutions built. The S14 engine was developed from Brabham's Formula 1 four-cylinder.", source: "mock" },
  { make: "Aston Martin", model: "Valkyrie", year: "2022–2024", category: "Hypercar", msrp: "$3,000,000", valueRange: "$3.4M – $3.9M", engine: "6.5L NA V12 + Hybrid", horsepower: "1,160 hp", zeroToSixty: "2.5 s", rarity: 10, funFact: "Co-developed with Adrian Newey of Red Bull Racing. Revs to 11,100 rpm — the highest of any production road car.", source: "mock" },
];

function mock(): IdentifyResult {
  return MOCK_POOL[Math.floor(Math.random() * MOCK_POOL.length)];
}

const SYSTEM_PROMPT = `You are CarSpotter — an expert automotive identifier.

Identification methodology (follow strictly):
1. Examine the BADGE / EMBLEM if visible — that's the highest-confidence signal.
2. Identify the generation by SPECIFIC visual cues:
   - Headlight shape + DRL pattern (every generation has a unique one)
   - Front bumper / grille geometry
   - Wheel design (often generation-specific)
   - Side body lines / character creases
   - Rear taillight pattern
   - Mirror cap shape
3. Cross-check year range against trim badges (e.g. "GTS", "S", "Performante").
4. If the photo is partial, blurry, side-only, or you cannot see distinguishing
   features → set confidence below 0.6 and pick the MOST LIKELY generation
   with the broadest year range, list alternatives in funFact.
5. NEVER guess specific trims (e.g. "GT3 RS" vs "GT3") without seeing trim-
   specific cues (wing, splitter, badge). If unsure, return the base model.

Return ONLY a valid JSON object (no prose, no markdown fences) matching this
exact shape. Fill EVERY field with real, researched data from your knowledge.
Production figures, auction sales, celebrity ownership, technical specs —
all must match the EXACT trim/generation you identified.

{
  "make": string,
  "model": string,
  "year": string,           // e.g. "2020–2023" or "1995"
  "category": "Supercar" | "Hypercar" | "Classic" | "Daily" | "JDM" | "Muscle" | "Luxury" | "SUV" | "Truck",
  "msrp": string,           // "$507,000" or "$56,000 (original)"
  "valueRange": string,     // "$550k – $750k" — realistic current market
  "engine": string,         // "4.0L Twin-Turbo V8 PHEV"
  "horsepower": string,     // "986 hp"
  "torque": string,         // "590 lb-ft"
  "zeroToSixty": string,    // "2.5 s"
  "topSpeed": string,       // "211 mph"
  "weight": string,         // "3,461 lbs"
  "drivetrain": string,     // "AWD" | "RWD" | "FWD"
  "transmission": string,   // "8-speed F1 DCT"
  "productionCount": number | null, // exact total if known
  "rarity": number,         // 0–10
  "celebrity": string | null, // documented owner if known
  "funFact": string,        // 1-2 sentences, surprising, factual
  "recentSale": { "auction": string, "date": string, "price": number } | null,
  "recalls": number | null,
  "wiki": string,           // 2-3 sentence deep-dive paragraph
  "confidence": number      // 0–1
}

Rules:
- Never invent specs. If you genuinely don't know a value, return null
  for that field (don't make up numbers).
- BE CAUTIOUS about confidence. If the photo is bad/partial, lower it.
- For wiki: include the most interesting non-obvious thing about this
  specific car — engineering story, racing history, design lore.
- For valueRange: use the most recent auction comp you actually know
  about. Older data is fine if labeled with the year.
- Match year/generation precisely from visual cues (headlight shape,
  bumper, badges, wheel style, body lines).
- When you genuinely cannot tell two generations apart (e.g. 996 vs 997
  Porsche), pick the SAFER bet and mention the uncertainty in funFact.
- If you see ANY chrome/wrap/aftermarket bodykit, note it explicitly —
  do not let it confuse you into a different make.

If the image does not contain an identifiable car, return:
{ "error": "no_car_detected" }

Do not add anything outside the JSON object.`;

export async function identifyCar(imageBase64: string, mimeType = "image/jpeg"): Promise<IdentifyResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // No key — use mock so the product still demonstrates.
    return mock();
  }

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: imageBase64,
              },
            },
            { type: "text", text: "Identify this car. Return JSON only." },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return mock();
    }

    const trimmed = textBlock.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(trimmed);
    if (parsed.error === "no_car_detected") {
      // Surface as a special mock with the error flagged
      return { ...mock(), funFact: "Couldn't see a car in this one — try another photo.", source: "claude" };
    }

    return {
      make: String(parsed.make ?? "Unknown"),
      model: String(parsed.model ?? "Unknown"),
      year: String(parsed.year ?? ""),
      category: String(parsed.category ?? "Daily"),
      msrp: String(parsed.msrp ?? "—"),
      valueRange: String(parsed.valueRange ?? "—"),
      engine: String(parsed.engine ?? "—"),
      horsepower: String(parsed.horsepower ?? "—"),
      zeroToSixty: String(parsed.zeroToSixty ?? "—"),
      rarity: Math.max(0, Math.min(10, Number(parsed.rarity ?? 5))),
      celebrity: parsed.celebrity ? String(parsed.celebrity) : undefined,
      funFact: String(parsed.funFact ?? ""),
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.9,
      // Pass through the extra rich fields so /api/car-info can return them
      // verbatim without enrich() needing a hardcoded fallback table.
      torque: parsed.torque ? String(parsed.torque) : undefined,
      topSpeed: parsed.topSpeed ? String(parsed.topSpeed) : undefined,
      weight: parsed.weight ? String(parsed.weight) : undefined,
      drivetrain: parsed.drivetrain ? String(parsed.drivetrain) : undefined,
      transmission: parsed.transmission ? String(parsed.transmission) : undefined,
      productionCount: typeof parsed.productionCount === "number" ? parsed.productionCount : undefined,
      recentSale: parsed.recentSale && typeof parsed.recentSale === "object" ? parsed.recentSale : undefined,
      recalls: typeof parsed.recalls === "number" ? parsed.recalls : undefined,
      wiki: parsed.wiki ? String(parsed.wiki) : undefined,
      source: "claude",
    } as any;
  } catch (err) {
    console.error("[identifyCar] Claude call failed, falling back to mock:", err);
    return mock();
  }
}
