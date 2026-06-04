import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Debug endpoint that bypasses lib/identify.ts and calls Claude directly.
 * Returns Claude's raw response + parsed result side-by-side so we can
 * see EXACTLY what's failing in identification.
 *
 * GET /api/debug-claude → tests with a hardcoded Porsche image
 * POST /api/debug-claude { image, mimeType } → tests with the supplied image
 *
 * Disable in prod once we're confident things work.
 */
export async function GET() {
  return runTest("hardcoded test image");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return runTest("user-supplied", body.image, body.mimeType);
}

async function runTest(label: string, image?: string, mimeType: string = "image/jpeg") {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    hasClaudeKey: !!process.env.ANTHROPIC_API_KEY,
    claudeKeyPrefix: process.env.ANTHROPIC_API_KEY?.slice(0, 16) + "...",
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ env, error: "no_api_key" }, { status: 500 });
  }

  // Default test image if none provided
  const base64 = image
    ? image.replace(/^data:image\/[a-zA-Z]+;base64,/, "")
    : await fetch(
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1500&q=90",
      )
        .then((r) => r.arrayBuffer())
        .then((buf) => Buffer.from(buf).toString("base64"));

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const start = Date.now();
    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2000,
      system: "You are an expert car identifier. Return ONLY a JSON object: {\"make\":\"...\",\"model\":\"...\",\"year\":\"...\"}",
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType as any, data: base64 } },
            { type: "text", text: "Identify this car. JSON only." },
          ],
        },
      ],
    });
    const elapsedMs = Date.now() - start;

    const textBlock = message.content.find((b) => b.type === "text");
    const rawText = textBlock?.type === "text" ? textBlock.text : null;

    let parsed: any = null;
    let parseError: string | null = null;
    if (rawText) {
      try { parsed = JSON.parse(rawText.trim()); } catch (e: any) {
        parseError = e.message;
        const m = rawText.match(/\{[\s\S]*\}/);
        if (m) {
          try { parsed = JSON.parse(m[0]); parseError = null; } catch (e2: any) {
            parseError = `Inner parse: ${e2.message}`;
          }
        }
      }
    }

    return NextResponse.json({
      env,
      label,
      elapsedMs,
      model: message.model,
      stop_reason: message.stop_reason,
      usage: message.usage,
      rawText,
      parsed,
      parseError,
    });
  } catch (err: any) {
    return NextResponse.json({
      env,
      label,
      error: err.message ?? String(err),
      type: err.constructor?.name,
      status: err.status,
      stack: err.stack?.split("\n").slice(0, 5),
    }, { status: 500 });
  }
}
