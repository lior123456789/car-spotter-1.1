import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE = "cs_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

export const dynamic = "force-dynamic";

/**
 * Called by the client after Firebase sign-in. Writes the Firebase UID
 * into the httpOnly cookie that the server-side storage layer reads.
 * This unifies "anonymous cookie user" and "Firebase user" into one ID.
 */
export async function POST(req: NextRequest) {
  let body: { uid?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.uid || typeof body.uid !== "string") {
    return NextResponse.json({ error: "missing_uid" }, { status: 400 });
  }
  cookies().set(COOKIE, body.uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}

/**
 * Called on sign-out — clears the cookie so the user goes back to an
 * anonymous identity.
 */
export async function DELETE() {
  cookies().delete(COOKIE);
  return NextResponse.json({ ok: true });
}
