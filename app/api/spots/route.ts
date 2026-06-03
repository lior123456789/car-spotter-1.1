import { NextResponse } from "next/server";
import { SPOTS } from "@/lib/spotData";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    count: SPOTS.length,
    byKind: SPOTS.reduce<Record<string, number>>((acc, s) => {
      acc[s.kind] = (acc[s.kind] ?? 0) + 1;
      return acc;
    }, {}),
    byCountry: SPOTS.reduce<Record<string, number>>((acc, s) => {
      acc[s.country] = (acc[s.country] ?? 0) + 1;
      return acc;
    }, {}),
    spots: SPOTS,
  });
}
