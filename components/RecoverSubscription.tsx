"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Loader2, Check, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { upsertUserProfile } from "@/lib/firebase";

/**
 * "I paid but my plan isn't showing" button — queries Stripe for the
 * user's active subscription by their signed-in email, then writes the
 * tier to their Firestore profile. Bypasses the webhook entirely.
 */
export function RecoverSubscription() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "found" | "none" | "error">("idle");
  const [plan, setPlan] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    if (!user?.email) return;
    setBusy(true);
    setStatus("idle");
    setErr(null);
    try {
      const res = await fetch(`/api/recover-subscription?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Stripe lookup failed");
      if (data.plan === "free") {
        setStatus("none");
        return;
      }
      // Write to Firestore
      await upsertUserProfile(user.uid, {
        plan: data.plan,
        stripeCustomerId: data.stripeCustomerId ?? undefined,
      } as any);
      setPlan(data.plan);
      setStatus("found");
      // Reload after a beat so /dashboard re-reads profile
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setStatus("error");
      setErr(e.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!user?.email) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 my-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Paid but plan not showing?</h3>
          <p className="text-sm text-spotter-mute mb-3">
            Click below — we'll check Stripe for your active subscription using <code className="bg-black/30 px-1.5 py-0.5 rounded">{user.email}</code> and unlock your plan immediately.
          </p>

          <button
            onClick={run}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold px-4 py-2 rounded-lg shadow hover:brightness-110 transition text-sm disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
            Restore my subscription
          </button>

          <AnimatePresence>
            {status === "found" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 text-sm text-emerald-300"
              >
                <Check className="w-4 h-4" />
                Found active <strong className="capitalize">{plan}</strong> subscription. Reloading dashboard…
              </motion.div>
            )}
            {status === "none" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 text-sm text-zinc-300"
              >
                <X className="w-4 h-4 text-spotter-mute" />
                No active subscription found on this email. If you paid with a different email, sign in with that one.
              </motion.div>
            )}
            {status === "error" && err && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 text-sm text-rose-300"
              >
                <X className="w-4 h-4" />
                {err}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
