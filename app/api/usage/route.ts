import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserId } from "@/lib/userId";
import { getUser, FREE_LIMIT } from "@/lib/storage";

export const dynamic = "force-dynamic";

function isLocalhost(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const host = req.headers.get("host") ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("0.0.0.0");
}

export async function GET(req: NextRequest) {
  const userId = getOrCreateUserId();
  const user = await getUser(userId);
  const localhost = isLocalhost(req);
  return NextResponse.json({
    plan: localhost ? "concours" : user.plan,
    freeScansUsed: localhost ? 0 : user.freeScansUsed,
    freeScansRemaining: localhost ? Infinity : Math.max(0, FREE_LIMIT - user.freeScansUsed),
    freeLimit: FREE_LIMIT,
    localhost,
    claudeEnabled: !!process.env.ANTHROPIC_API_KEY,
  });
}
