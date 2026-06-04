/**
 * Car identification.
 *   - If ANTHROPIC_API_KEY is set: real call to Claude vision (claude-opus-4-7)
 *   - Otherwise: returns a randomized mock so the demo still works.
 *
 * Reverted to a SIMPLE direct-JSON prompt for reliability. The previous
 * <thinking>-tags structure was hitting max_tokens before the JSON
 * block completed, causing extractJson() to return null and the silent
 * fallback to MOCK_POOL[0] = Ferrari SF90. We trade a bit of
 * identification rigor for ALWAYS returning real Claude data.
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

const SYSTEM_PROMPT = `You are CarSpotter — an expert automotive identifier with deep knowledge of every production vehicle.

Identify the car in the photo as PRECISELY as possible. Look at: badge,
headlights, grille mesh, wheel design, body lines, taillights, mirrors.
Pin the exact generation and (when possible) the single model year.

Return ONLY a raw JSON object — no prose, no markdown fences. Schema:

{
  "make": string,
  "model": string,
  "year": string,
  "category": "Supercar" | "Hypercar" | "Classic" | "Daily" | "JDM" | "Muscle" | "Luxury" | "SUV" | "Truck",
  "msrp": string,
  "valueRange": string,
  "engine": string,
  "horsepower": string,
  "torque": string,
  "zeroToSixty": string,
  "topSpeed": string,
  "weight": string,
  "drivetrain": "AWD" | "RWD" | "FWD" | "4WD",
  "transmission": string,
  "productionCount": number | null,
  "rarity": number,
  "celebrity": string | null,
  "funFact": string,
  "recentSale": { "auction": string, "date": string, "price": number } | null,
  "recalls": number | null,
  "wiki": string,
  "confidence": number
}

If you cannot identify a car, return: {"error":"no_car_detected"}`;

function extractJson(text: string): any | null {
  try { return JSON.parse(text.trim()); } catch {}
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/i);
  if (fenced) { try { return JSON.parse(fenced[1].trim()); } catch {} }
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch { break; }
      }
    }
  }
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
      max_tokens: 2000,
      // claude-opus-4-7 does NOT accept `temperature`. Do not re-add.
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
            { type: "text", text: "Identify this car. Return ONLY the JSON object — no other text." },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.error("[identifyCar] No text block in response");
      return mock();
    }
    const raw = textBlock.text;

    const parsed = extractJson(raw);
    if (!parsed) {
      console.error("[identifyCar] No JSON extractable from:", raw.slice(0, 500));
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
  } catch (err: any) {
    console.error("[identifyCar] Claude call failed:", err?.message ?? err);
    return mock();
  }
}
