import { NextResponse } from "next/server";
import { aggregateStats } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(aggregateStats());
}
