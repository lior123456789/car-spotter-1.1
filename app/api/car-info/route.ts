import { NextRequest, NextResponse } from "next/server";
import { enrich } from "@/lib/carData";
import { identifyCar } from "@/lib/identify";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Rich car identification endpoint. Combines:
 *   1. Claude vision identification (make/model/year/specs/MSRP/value)
 *   2. carData.ts enrichment (production counts, top speed, weight,
 *      drivetrain, recent auction sales, deep trivia)
 *
 * Returns a full EnrichedCarInfo object suitable for the main app's
 * "car detail" view. Falls back to mock data when no ANTHROPIC_API_KEY.
 */
export async function POST(req: NextRequest) {
  let body: { image?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.image) return NextResponse.json({ error: "missing_image" }, { status: 400 });
  const base64 = body.image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  const mimeType = body.mimeType ?? "image/jpeg";

  const claudeResult = await identifyCar(base64, mimeType);
  const enriched = enrich(claudeResult);

  return NextResponse.json({ result: enriched });
}
