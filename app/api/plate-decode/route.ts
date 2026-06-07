import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * License Plate Decoder proxy (CarsXE Vehicle Plate Decoder API).
 * Keeps the CarsXE key server-side — the iOS app calls this, never CarsXE
 * directly. Concours-tier feature; gating is enforced client-side.
 *
 * GET /api/plate-decode?plate=7XER187&state=CA[&country=US]
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plate = (searchParams.get("plate") ?? "").trim();
  const state = (searchParams.get("state") ?? "").trim();
  const country = (searchParams.get("country") ?? "US").trim().toUpperCase();

  if (!plate) {
    return NextResponse.json({ success: false, error: "Missing plate." }, { status: 400 });
  }
  // US, AU, CA require a state/province.
  if (["US", "AU", "CA"].includes(country) && !state) {
    return NextResponse.json(
      { success: false, error: `State is required for ${country}.` },
      { status: 400 },
    );
  }

  const key = process.env.CARSXE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { success: false, error: "Plate decoder not configured." },
      { status: 503 },
    );
  }

  const url = new URL("https://api.carsxe.com/v2/platedecoder");
  url.searchParams.set("key", key);
  url.searchParams.set("plate", plate);
  url.searchParams.set("country", country);
  if (state) url.searchParams.set("state", state);

  try {
    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json().catch(() => null);
    if (!r.ok || !data) {
      return NextResponse.json(
        { success: false, error: "Plate lookup failed." },
        { status: 502 },
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[plate-decode] error", err);
    return NextResponse.json({ success: false, error: "Plate lookup failed." }, { status: 502 });
  }
}
