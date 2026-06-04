/**
 * Car identification.
 *   - If ANTHROPIC_API_KEY is set: real call to Claude with vision (claude-opus-4-7)
 *   - Otherwise: returns a randomized mock so the demo still works.
 *
 * Strategy: Claude reasons through the photo step-by-step in
 * <thinking> tags, then emits a strict JSON block. We extract only the
 * JSON from the response. Reasoning happens BEFORE the JSON so the
 * model isn't pressured into immediate guesses.
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
  // Rich enrichment fields (Claude returns these directly)
  torque?: string;
  topSpeed?: string;
  weight?: string;
  drivetrain?: string;
  transmission?: string;
  productionCount?: number;
  recentSale?: { auction: string; date: string; price: number };
  recalls?: number;
  wiki?: string;
};

const MOCK_POOL: IdentifyResult[] = [
  { make: "Ferrari", model: "SF90 Stradale", year: "2020–2023", category: "Supercar", msrp: "$507,000", valueRange: "$550k – $750k", engine: "4.0L Twin-Turbo V8 PHEV", horsepower: "986 hp", zeroToSixty: "2.5 s", rarity: 8, celebrity: "David Beckham", funFact: "First production Ferrari to use a plug-in hybrid powertrain — the V8 alone makes 769 hp.", source: "mock" },
  { make: "Porsche", model: "911 GT3 RS (992)", year: "2023–2024", category: "Supercar", msrp: "$241,300", valueRange: "$290k – $360k", engine: "4.0L NA Flat-Six", horsepower: "518 hp", zeroToSixty: "3.0 s", rarity: 7, funFact: "DRS system borrowed from F1 — the rear wing can flatten itself mid-corner to keep top speed up.", source: "mock" },
];

function mock(): IdentifyResult {
  return MOCK_POOL[Math.floor(Math.random() * MOCK_POOL.length)];
}

const SYSTEM_PROMPT = `You are CarSpotter — an expert automotive identifier with deep
knowledge of every production vehicle from 1900 to today.

## METHODOLOGY (follow strictly)

You will reason step-by-step in <thinking> tags BEFORE returning JSON. Inside
the thinking block:

  1. **List visual evidence**:
     - Badge / emblem (highest-confidence signal — read it if visible)
     - Headlight shape, DRL signature, beam pattern
     - Grille geometry, mesh pattern, badge placement
     - Wheel design + size
     - Front bumper / splitter
     - Hood vents / power-dome / clamshell
     - Side body lines / character creases / fender flares
     - Mirror cap shape
     - Taillight pattern + position
     - Exhaust layout
     - Roofline (coupe, fastback, GT, targa)
     - Color, wraps, modifications

  2. **Narrow the candidates** to 2-3 likely make/model/generation matches.

  3. **Pick the most likely** based on the discriminating cue. State which
     cue tipped the decision.

  4. **Estimate confidence** 0.0-1.0. Be HONEST. If you only see a side
     profile, do not claim 0.95.

  5. **Lock in year range / trim**. Don't promote a base model to a
     special edition (GT3 vs GT3 RS, M3 vs M3 CSL) without trim-specific
     visual evidence (wings, splitters, special wheels, badge).

After your thinking block, output exactly one JSON object inside a
\`\`\`json fenced block with this shape:

{
  "make": string,
  "model": string,                  // base model name, no trim noise
  "year": string,                   // e.g. "2020–2023" or "1995"
  "category": "Supercar" | "Hypercar" | "Classic" | "Daily" | "JDM" | "Muscle" | "Luxury" | "SUV" | "Truck",
  "msrp": string,
  "valueRange": string,             // realistic current market range
  "engine": string,
  "horsepower": string,
  "torque": string | null,
  "zeroToSixty": string,
  "topSpeed": string | null,
  "weight": string | null,
  "drivetrain": "AWD" | "RWD" | "FWD" | "4WD",
  "transmission": string | null,
  "productionCount": number | null,
  "rarity": number,                 // 0-10
  "celebrity": string | null,
  "funFact": string,                // 1-2 sentences, surprising, factual
  "recentSale": { "auction": string, "date": string, "price": number } | null,
  "recalls": number | null,
  "wiki": string,                   // 2-3 sentence deep dive
  "confidence": number              // 0-1
}

Rules:
- Never invent specs. Return null when unsure.
- valueRange uses real recent auction comps. Cite a year in funFact if
  the comp is older than 2 years.
- If the image does not contain an identifiable car, return:
  \`\`\`json
  { "error": "no_car_detected" }
  \`\`\`
- Output ONLY the thinking block then the JSON. No extra prose.`;

function extractJson(text: string): any | null {
  // 1. Prefer fenced ```json block
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch {}
  }
  // 2. Look for the last top-level { ... } block
  const lastBrace = text.lastIndexOf("{");
  const firstBrace = text.indexOf("{");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const slice = text.slice(firstBrace, lastBrace + text.slice(lastBrace).indexOf("}") + 1);
    try { return JSON.parse(slice); } catch {}
  }
  // 3. Raw JSON
  try { return JSON.parse(text.trim()); } catch {}
  return null;
}

export async function identifyCar(
  imageBase64: string,
  mimeType: string = "image/jpeg",
): Promise<IdentifyResult> {
  if (!process.env.ANTHROPIC_API_KEY) return mock();

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 3000,         // room for both thinking + JSON
      temperature: 0.1,         // tight: car ID needs precision, not creativity
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
            {
              type: "text",
              text: "Identify this car. Think step by step in <thinking> tags first, then output the JSON.",
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return mock();
    const raw = textBlock.text;

    const parsed = extractJson(raw);
    if (!parsed) {
      console.error("[identifyCar] No JSON in response:", raw.slice(0, 300));
      return mock();
    }

    if (parsed.error === "no_car_detected") {
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
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
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
    };
  } catch (err) {
    console.error("[identifyCar] Claude call failed:", err);
    return mock();
  }
}
