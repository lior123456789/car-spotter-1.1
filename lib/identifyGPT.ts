/**
 * Car identification via OpenAI GPT-4o vision.
 * Returns the same IdentifyResult shape as the Claude path so callers
 * don't need to know which model produced the result.
 */

import type { IdentifyResult } from "./identify";

const SYSTEM_PROMPT = `You are CarSpotter — an expert automotive identifier with deep knowledge of every production vehicle from 1900 to today.

Identify the car in the photo as PRECISELY as possible. Look at:
- Badge / emblem (highest-confidence signal)
- Headlights + DRL pattern (unique per generation)
- Grille mesh and badge placement
- Wheel design + size
- Front bumper / splitter, hood vents, body lines
- Mirror caps, taillight pattern, exhaust layout
- Roofline, color, modifications

Pin the exact generation and SINGLE model year when possible. Never invent specs - return null when unsure. Be honest about confidence.

Return ONLY a JSON object matching this schema:

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

If no identifiable car: {"error":"no_car_detected"}`;

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

export async function identifyCarWithGPT(
  imageBase64: string,
  mimeType: string = "image/jpeg",
): Promise<IdentifyResult | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  // Same defensive sanitize that fixed the Claude key — strips any non-
  // printable-ASCII that env editors might inject.
  const apiKey = process.env.OPENAI_API_KEY
    .replace(/[^\x20-\x7e]/g, "")
    .trim();

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this car. JSON only." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`[identifyCarWithGPT] HTTP ${resp.status}: ${errText.slice(0, 400)}`);
      return null;
    }

    const body: any = await resp.json();
    const raw = body?.choices?.[0]?.message?.content;
    if (!raw) {
      console.error("[identifyCarWithGPT] No content in response");
      return null;
    }

    const parsed = extractJson(raw);
    if (!parsed) {
      console.error("[identifyCarWithGPT] No JSON extractable from:", raw.slice(0, 400));
      return null;
    }

    if (parsed.error === "no_car_detected") {
      return {
        make: "Couldn't identify",
        model: "Try another photo or check connection",
        year: "—",
        category: "Daily",
        msrp: "—",
        valueRange: "—",
        engine: "—",
        horsepower: "—",
        zeroToSixty: "—",
        rarity: 0,
        funFact: "We couldn't see a car clearly in this photo — try another angle.",
        source: "mock",
      };
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
      source: "claude",  // keep "claude" string for downstream compat
    };
  } catch (err: any) {
    console.error("[identifyCarWithGPT] call failed:", err?.message ?? err);
    return null;
  }
}
