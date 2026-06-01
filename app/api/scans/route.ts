import { NextResponse } from "next/server";
import { SCANS } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    count: SCANS.length,
    scans: SCANS.slice().sort((a, b) => b.spottedAt.localeCompare(a.spottedAt)),
  });
}
