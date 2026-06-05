import { NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, FIREBASE_CONFIGURED } from "@/lib/firebase";

export const dynamic = "force-dynamic";

/**
 * Lead capture for the NIGHT DRIVE arcade funnel (/drive).
 * Stores an email + game score into Firestore `/leads`, which feeds the
 * CarSpotter launch / outreach list. Always responds 200 so the game UX
 * never breaks on a write failure.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const score = Number.isFinite(+body?.score) ? Math.floor(+body.score) : 0;
    const source = String(body?.source ?? "night-drive").slice(0, 40);

    // basic email sanity check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 200 });
    }

    if (FIREBASE_CONFIGURED) {
      const firestore = db();
      if (firestore) {
        await addDoc(collection(firestore, "leads"), {
          email,
          score,
          source,
          userAgent: req.headers.get("user-agent")?.slice(0, 200) ?? "",
          createdAt: serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead] capture failed", err);
    // Optimistic: don't surface backend failure to the player.
    return NextResponse.json({ ok: true, soft: true });
  }
}
