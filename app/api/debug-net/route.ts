import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Probe outbound connectivity from Render to common external hosts. */
export async function GET() {
  const targets = [
    "https://api.anthropic.com/v1/messages",
    "https://api.stripe.com/v1/account",
    "https://www.google.com/",
    "https://httpbin.org/status/200",
  ];

  const results = await Promise.all(
    targets.map(async (url) => {
      const start = Date.now();
      try {
        const res = await fetch(url, {
          method: url.includes("anthropic") || url.includes("stripe") ? "POST" : "GET",
          headers: { "Content-Type": "application/json" },
          body: url.includes("anthropic") || url.includes("stripe") ? "{}" : undefined,
          signal: AbortSignal.timeout(8000),
        });
        return {
          url,
          ok: true,
          status: res.status,
          elapsedMs: Date.now() - start,
        };
      } catch (err: any) {
        return {
          url,
          ok: false,
          error: err.message ?? String(err),
          name: err.name,
          elapsedMs: Date.now() - start,
        };
      }
    }),
  );

  return NextResponse.json({
    nodeVersion: process.version,
    region: process.env.RENDER_REGION ?? "unknown",
    results,
  });
}
