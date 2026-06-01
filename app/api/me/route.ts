import { NextResponse } from "next/server";
import { getOrCreateUserId } from "@/lib/userId";
import { getUser, listScans } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = getOrCreateUserId();
  const user = await getUser(userId);
  const scans = await listScans(userId);
  return NextResponse.json({
    user: {
      id: user.id,
      plan: user.plan,
      freeScansUsed: user.freeScansUsed,
      createdAt: user.createdAt,
    },
    scans,
  });
}
