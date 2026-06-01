import { NextResponse } from "next/server";
import { getOrCreateUserId } from "@/lib/userId";
import { getUser, FREE_LIMIT } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = getOrCreateUserId();
  const user = await getUser(userId);
  return NextResponse.json({
    plan: user.plan,
    freeScansUsed: user.freeScansUsed,
    freeScansRemaining: Math.max(0, FREE_LIMIT - user.freeScansUsed),
    freeLimit: FREE_LIMIT,
  });
}
