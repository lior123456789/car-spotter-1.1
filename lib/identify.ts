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

const SYSTEM_PROMPT = `You are CarSpotter — an expert automotive identification engine.

When given a photo of a car, return ONLY a valid JSON object (no prose, no
markdown fences) matching this exact shape:

{
  "make": string,
  "model": string,
  "year": string,           // e.g. "2020–2023" or "1995"
  "category": "Supercar" | "Hypercar" | "Classic" | "Daily" | "JDM" | "Muscle" | "Luxury" | "SUV" | "Truck",
  "msrp": string,           // "$507,000" or "$56,000 (original)"
  "valueRange": string,     // "$550k – $750k"
  "engine": string,         // "4.0L Twin-Turbo V8 PHEV"
  "horsepower": string,     // "986 hp"
  "zeroToSixty": string,    // "2.5 s"
  "rarity": number,         // 0–10
  "celebrity": string | null,
  "funFact": string,        // one sentence, ≤180 chars
  "confidence": number      // 0–1
}

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
      source: "claude",
    };
  } catch (err) {
    console.error("[identifyCar] Claude call failed, falling back to mock:", err);
    return mock();
  }
}
