/**
 * Multi-model car identification ensemble.
 *
 * Strategy:
 *   1. Run GPT-4o vision + Claude vision in PARALLEL
 *   2. If they agree on make+model → high-confidence result
 *   3. If they disagree → run a TIE-BREAKER pass using GPT-4o again,
 *      this time told both candidate answers and asked to verify with
 *      step-by-step visual reasoning
 *   4. Return whichever survives, with a confidence reflecting agreement
 *
 * Falls back gracefully when only one provider key is set.
 */

import type { IdentifyResult } from "./identify";
import { identifyCarWithGPT } from "./identifyGPT";

const TIEBREAKER_SYSTEM = `You are an expert automotive identifier acting as a tie-breaker.

Two AI vision models gave different identifications for the same car
photo. Your job: examine the photo carefully and decide which (if
either) is correct, OR provide your own identification.

Look at: badge, headlights, grille mesh, wheel design, body lines,
taillights, mirrors. Pin the exact generation and year if possible.

Return ONLY a JSON object with your final answer:

{
  "make": string, "model": string, "year": string,
  "category": "Supercar" | "Hypercar" | "Classic" | "Daily" | "JDM" | "Muscle" | "Luxury" | "SUV" | "Truck",
  "msrp": string, "valueRange": string, "engine": string,
  "horsepower": string, "torque": string, "zeroToSixty": string,
  "topSpeed": string, "weight": string, "drivetrain": "AWD" | "RWD" | "FWD" | "4WD",
  "transmission": string, "productionCount": number | null,
  "rarity": number, "celebrity": string | null, "funFact": string,
  "recentSale": { "auction": string, "date": string, "price": number } | null,
  "recalls": number | null, "wiki": string, "confidence": number,
  "reasoning": string
}`;

async function runGPTTiebreaker(
  imageBase64: string,
  mimeType: string,
  candidateA: IdentifyResult,
  candidateB: IdentifyResult,
): Promise<IdentifyResult | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  const apiKey = process.env.OPENAI_API_KEY.replace(/[^\x20-\x7e]/g, "").trim();

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
          { role: "system", content: TIEBREAKER_SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `Model A says: ${candidateA.year} ${candidateA.make} ${candidateA.model} (conf=${candidateA.confidence})\n` +
                  `Model B says: ${candidateB.year} ${candidateB.make} ${candidateB.model} (conf=${candidateB.confidence})\n\n` +
                  `Examine the photo and return your final answer.`,
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "high" },
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!resp.ok) return null;
    const body: any = await resp.json();
    const raw = body?.choices?.[0]?.message?.content;
    if (!raw) return null;

    let parsed: any = null;
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) try { parsed = JSON.parse(m[0]); } catch {}
    }
    if (!parsed) return null;

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
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
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
  } catch {
    return null;
  }
}

async function callClaudeVision(imageBase64: string, mimeType: string): Promise<IdentifyResult | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const apiKey = process.env.ANTHROPIC_API_KEY.replace(/[^\x20-\x7e]/g, "").trim();

  const SYSTEM_PROMPT = `Identify the car in the photo. Look at badge, headlights, grille, wheels, body lines, taillights. Pin the exact generation and year.

Return ONLY a JSON object — no prose:
{"make":string,"model":string,"year":string,"category":string,"msrp":string,"valueRange":string,"engine":string,"horsepower":string,"torque":string,"zeroToSixty":string,"topSpeed":string,"weight":string,"drivetrain":string,"transmission":string,"productionCount":number|null,"rarity":number,"celebrity":string|null,"funFact":string,"recentSale":{"auction":string,"date":string,"price":number}|null,"recalls":number|null,"wiki":string,"confidence":number}`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-7",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
            { type: "text", text: "Identify this car. JSON only." },
          ],
        }],
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!resp.ok) return null;
    const message: any = await resp.json();
    const textBlock = message?.content?.find?.((b: any) => b.type === "text");
    if (!textBlock?.text) return null;

    let parsed: any = null;
    try { parsed = JSON.parse(textBlock.text.trim()); } catch {
      const m = textBlock.text.match(/\{[\s\S]*\}/);
      if (m) try { parsed = JSON.parse(m[0]); } catch {}
    }
    if (!parsed) return null;

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
  } catch {
    return null;
  }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function agrees(a: IdentifyResult, b: IdentifyResult): "exact" | "model" | "make" | "none" {
  const aMake = normalize(a.make);
  const bMake = normalize(b.make);
  const aModel = normalize(a.model);
  const bModel = normalize(b.model);
  if (aMake !== bMake) return "none";
  // Same make. Check model overlap (one might say "911" the other "911 GT3")
  if (aModel === bModel) return "exact";
  if (aModel.includes(bModel) || bModel.includes(aModel)) return "model";
  return "make";
}

export async function identifyCarEnsemble(
  imageBase64: string,
  mimeType: string,
): Promise<IdentifyResult | null> {
  // Fire both providers in parallel
  const [gpt, claude] = await Promise.all([
    identifyCarWithGPT(imageBase64, mimeType),
    callClaudeVision(imageBase64, mimeType),
  ]);

  // Filter out the "Couldn't identify" placeholder
  const gptReal = gpt && gpt.make !== "Couldn't identify" ? gpt : null;
  const claudeReal = claude && claude.make !== "Couldn't identify" ? claude : null;

  // Both failed
  if (!gptReal && !claudeReal) return null;

  // Only one worked
  if (gptReal && !claudeReal) return gptReal;
  if (claudeReal && !gptReal) return claudeReal;

  // Both worked. Compare.
  const aMode = agrees(gptReal!, claudeReal!);

  if (aMode === "exact") {
    // Full agreement → highest confidence
    const winner = (gptReal!.confidence ?? 0.7) >= (claudeReal!.confidence ?? 0.7) ? gptReal! : claudeReal!;
    return { ...winner, confidence: Math.max(0.95, winner.confidence ?? 0.7) };
  }

  if (aMode === "model") {
    // Mostly agree — pick the more specific one (longer model name)
    const winner = gptReal!.model.length >= claudeReal!.model.length ? gptReal! : claudeReal!;
    return { ...winner, confidence: Math.max(0.9, winner.confidence ?? 0.7) };
  }

  // Disagreement on make. Run tiebreaker.
  const tiebreak = await runGPTTiebreaker(imageBase64, mimeType, gptReal!, claudeReal!);
  if (tiebreak) return tiebreak;

  // Tiebreaker failed → return whichever was more confident
  return (gptReal!.confidence ?? 0) >= (claudeReal!.confidence ?? 0) ? gptReal! : claudeReal!;
}
