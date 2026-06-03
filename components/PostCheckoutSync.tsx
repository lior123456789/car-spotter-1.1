"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { upsertUserProfile } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";

/**
 * Mounted on /dashboard. Detects the post-checkout query params
 * (?upgraded=1&session_id=cs_...) that Stripe Checkout appends, verifies
 * the session server-side, and writes the new plan to the user's
 * Firestore /users/{uid} doc. Shows a non-blocking success toast.
 */
export function PostCheckoutSync() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [plan, setPlan] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = sp?.get("session_id");
    const upgraded = sp?.get("upgraded");
    if (!sessionId || upgraded !== "1") return;
    if (!user) return;

    setStatus("syncing");

    (async () => {
      try {
        const res = await fetch(`/api/verify-subscription?session_id=${sessionId}`);
        if (!res.ok) throw new Error(`verify failed (${res.status})`);
        const data = await res.json();
        if (!data.plan || data.plan === "free") {
          throw new Error(data.error ?? "no plan returned");
        }

        await upsertUserProfile(user.uid, {
          plan: data.plan,
          stripeCustomerId: data.customerId ?? undefined,
        } as any);

        setPlan(data.plan);
        setStatus("done");

        // Clean the URL so a refresh doesn't re-run
        const url = new URL(window.location.href);
        url.searchParams.delete("session_id");
        url.searchParams.delete("upgraded");
        router.replace(url.pathname + url.search);
      } catch (e: any) {
        setErr(e.message ?? "Something went wrong");
        setStatus("error");
      }
    })();
  }, [sp, user, router]);

  return (
    <AnimatePresence>
      {status !== "idle" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-[90vw]"
        >
          <div
            className={
              "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md " +
              (status === "done"
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                : status === "error"
                ? "border-rose-500/40 bg-rose-500/15 text-rose-200"
                : "border-spotter-cyan/40 bg-spotter-cyan/10 text-white")
            }
          >
            {status === "syncing" && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === "done" && <Check className="w-4 h-4" />}
            {status === "error" && <X className="w-4 h-4" />}
            <div className="flex-1 text-sm font-medium">
              {status === "syncing" && "Activating your subscription…"}
              {status === "done" && `Welcome to ${plan?.charAt(0).toUpperCase()}${plan?.slice(1)}! Subscription saved.`}
              {status === "error" && `Sync failed: ${err}`}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
