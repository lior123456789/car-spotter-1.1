import { NextResponse } from "next/server";
import { todaysChallenge } from "@/lib/dailyChallenge";

// Force-dynamic so each request gets the right "today" — Render edge
// could cache otherwise and show yesterday's challenge after midnight.
export const dynamic = "force-dynamic";

export async function GET() {
  const c = todaysChallenge();
  return NextResponse.json({
    challenge: c,
    expiresAt: new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + 1)
    ).toISOString(),
  });
}
