import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * VIN Decoder proxy (CarsXE Specs API). Keeps the CarsXE key server-side.
 * GET /api/vin-decode?vin=WBAFR7C57CC811956
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vin = (searchParams.get("vin") ?? "").trim().toUpperCase();

  if (!/^[A-HJ-NPR-Z0-9]{11,17}$/.test(vin)) {
    return NextResponse.json({ success: false, error: "Enter a valid VIN." }, { status: 400 });
  }

  const key = process.env.CARSXE_API_KEY;
  if (!key) {
    return NextResponse.json({ success: false, error: "VIN decoder not configured." }, { status: 503 });
  }

  const url = new URL("https://api.carsxe.com/specs");
  url.searchParams.set("key", key);
  url.searchParams.set("vin", vin);

  try {
    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json().catch(() => null);
    if (!r.ok || !data) {
      return NextResponse.json({ success: false, error: "VIN lookup failed." }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[vin-decode] error", err);
    return NextResponse.json({ success: false, error: "VIN lookup failed." }, { status: 502 });
  }
}
