import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserId } from "@/lib/userId";
import { getUser, bumpFreeScans, recordScan, isPaid, FREE_LIMIT } from "@/lib/storage";
import { identifyCar } from "@/lib/identify";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // seconds — Claude vision can take 10s+

/** Bypass paywall on localhost so dev/demo can use every feature freely. */
function isLocalhost(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const host = req.headers.get("host") ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("0.0.0.0");
}

type Body = { image?: string; mimeType?: string };

function ulid() {
  return "scn_" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.image || typeof body.image !== "string") {
    return NextResponse.json({ error: "missing_image" }, { status: 400 });
  }

  // Strip data URL prefix if present
  const base64 = body.image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  const mimeType = body.mimeType ?? "image/jpeg";

  // Rough payload cap — Claude vision limit + our own sanity check
  if (base64.length > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "image_too_large" }, { status: 413 });
  }

  const userId = getOrCreateUserId();
  const user = await getUser(userId);
  const localhost = isLocalhost(req);

  // On localhost, every feature is unlocked — no paywall, unlimited scans.
  if (!localhost && !isPaid(user) && user.freeScansUsed >= FREE_LIMIT) {
    return NextResponse.json(
      {
        error: "paywall",
        message: "Free trial used up — upgrade to keep scanning.",
        freeScansUsed: user.freeScansUsed,
        freeLimit: FREE_LIMIT,
      },
      { status: 402 },
    );
  }

  const result = await identifyCar(base64, mimeType);

  // Persist scan
  await recordScan(userId, {
    id: ulid(),
    make: result.make,
    model: result.model,
    year: result.year,
    msrp: parseMoney(result.msrp),
    valueLow: parseMoneyRangeLow(result.valueRange),
    valueHigh: parseMoneyRangeHigh(result.valueRange),
    rarity: result.rarity,
    // we only typed our internal Scan category union; cast to string-compatible
    category: (result.category as "Supercar" | "Hypercar" | "Classic" | "Daily" | "JDM" | "Muscle" | "Luxury") ?? "Daily",
    location: "Free scan via web",
    thumb: result.thumb ?? "",
    spottedAt: new Date().toISOString(),
    celebrityOwner: result.celebrity,
  });

  let updated = user;
  // On localhost we don't burn free scans — count stays at 0.
  if (!localhost && !isPaid(user)) {
    updated = await bumpFreeScans(userId);
  }

  return NextResponse.json({
    result,
    user: {
      plan: localhost ? "concours" : updated.plan,        // localhost simulates top tier
      freeScansUsed: localhost ? 0 : updated.freeScansUsed,
      freeScansRemaining: localhost ? Infinity : Math.max(0, FREE_LIMIT - updated.freeScansUsed),
      freeLimit: FREE_LIMIT,
      localhost,
      claudeEnabled: !!process.env.ANTHROPIC_API_KEY,
    },
  });
}

function parseMoney(s: string): number {
  const m = s.replace(/[^0-9]/g, "");
  return parseInt(m, 10) || 0;
}
function parseMoneyRangeLow(s: string): number {
  const part = s.split("–")[0] ?? s.split("-")[0] ?? s;
  return parseMoneyShort(part);
}
function parseMoneyRangeHigh(s: string): number {
  const parts = s.split("–").length > 1 ? s.split("–") : s.split("-");
  return parseMoneyShort(parts[1] ?? parts[0] ?? "");
}
function parseMoneyShort(s: string): number {
  const t = s.trim();
  const n = parseFloat(t.replace(/[^0-9.]/g, "")) || 0;
  if (/m\b/i.test(t)) return Math.round(n * 1_000_000);
  if (/k\b/i.test(t)) return Math.round(n * 1_000);
  return Math.round(n);
}
