import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * "Ask about this car" chat (Collector+ feature). Claude answers questions
 * about a specific identified car. Key stays server-side; gating is enforced
 * in the app. Uses plain fetch (the SDK throws on Render's Node runtime).
 *
 * POST { car: {...}, messages: [{role:"user"|"assistant", content:string}] }
 *  -> { answer: string }
 */
type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const car = body?.car ?? {};
  const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];

  // Sanitize + cap the conversation.
  const clean = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));

  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return NextResponse.json({ error: "Ask a question." }, { status: 400 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "AI chat not configured." }, { status: 503 });
  }

  const carLine = [car.year, car.make, car.model].filter(Boolean).join(" ") || "this car";
  const specs = [
    car.msrp && `Original MSRP: ${car.msrp}`,
    car.valueRange && `Value today: ${car.valueRange}`,
    car.engine && `Engine: ${car.engine}`,
    car.horsepower && `Horsepower: ${car.horsepower}`,
    car.category && `Category: ${car.category}`,
    typeof car.rarity === "number" && `Rarity: ${car.rarity}/10`,
  ].filter(Boolean).join(" · ");

  const system =
    `You are CarSpotter's in-app car expert. The user just identified a ${carLine} and wants to learn more about it.` +
    (specs ? ` Known details — ${specs}.` : "") +
    ` Answer their questions about this car accurately and conversationally. Keep replies short (2-4 sentences), no markdown headers. ` +
    `If asked something off-topic, gently steer back to the car. If you're unsure of an exact figure, say so rather than inventing it.`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key.replace(/[^\x20-\x7e]/g, "").trim(),
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system,
        messages: clean,
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error(`[ask] Anthropic HTTP ${resp.status}: ${t.slice(0, 300)}`);
      return NextResponse.json({ error: "AI is busy, try again." }, { status: 502 });
    }

    const data: any = await resp.json();
    const answer = (data?.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    return NextResponse.json({ answer: answer || "Hmm, I didn't catch that — try rephrasing?" });
  } catch (err) {
    console.error("[ask] error", err);
    return NextResponse.json({ error: "AI is busy, try again." }, { status: 502 });
  }
}
