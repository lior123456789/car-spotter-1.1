"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Mail, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp?.get("next") ?? "/scan";
  const { user, configured, signInGoogle, signInEmail, signUpEmail, signInAnonymous } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"google" | "email" | "anon" | null>(null);
  const [err, setErr] = useState("");

  // If already signed in, bounce to next
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function syncCookie(uid: string, email?: string) {
    await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email }),
    });
  }

  async function doGoogle() {
    setBusy("google");
    setErr("");
    try {
      await signInGoogle();
    } catch (e: any) {
      setErr(e.message ?? "Google sign-in failed.");
    } finally {
      setBusy(null);
    }
  }

  async function doEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy("email");
    setErr("");
    try {
      if (mode === "signin") await signInEmail(email, password);
      else await signUpEmail(email, password);
    } catch (e: any) {
      setErr(e.message ?? "Sign-in failed.");
    } finally {
      setBusy(null);
    }
  }

  async function doAnon() {
    setBusy("anon");
    setErr("");
    try {
      await signInAnonymous();
    } catch (e: any) {
      setErr(e.message ?? "Anonymous sign-in failed.");
    } finally {
      setBusy(null);
    }
  }

  // When auth state changes (user becomes non-null), sync the cookie.
  useEffect(() => {
    if (user) {
      syncCookie(user.uid, user.email ?? undefined).then(() => router.replace(next));
    }
  }, [user, next, router]);

  return (
    <main className="min-h-screen bg-spotter-ink text-white grid place-items-center px-4 py-12 relative overflow-hidden">
      {/* glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(34,211,238,0.25), transparent 70%)," +
            "radial-gradient(ellipse 50% 40% at 50% 100%, rgba(168,85,247,0.20), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spotter-cyan to-spotter-violet grid place-items-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-xl tracking-tight">CarSpotter</span>
        </Link>

        <div className="bg-spotter-panel border border-spotter-line rounded-2xl p-8 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-spotter-line bg-spotter-ink/60 text-xs text-zinc-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-spotter-cyan" />
            <span>{mode === "signin" ? "Welcome back" : "Create your account"}</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            {mode === "signin" ? "Sign in to" : "Get started with"} <span className="gradient-text">CarSpotter</span>
          </h1>
          <p className="text-sm text-spotter-mute mb-6">
            {mode === "signin"
              ? "Pick up where you left off — your garage syncs across devices."
              : "Free forever for 3 scans. No card needed."}
          </p>

          {!configured && (
            <div className="mb-5 text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded p-3">
              Firebase isn't configured for this build. You can still try
              the demo via <button onClick={doAnon} className="underline">guest mode</button>.
            </div>
          )}

          {/* Google */}
          <button
            onClick={doGoogle}
            disabled={!configured || busy !== null}
            className="w-full inline-flex items-center justify-center gap-3 bg-white text-spotter-ink font-semibold py-3 rounded-xl hover:bg-white/90 transition disabled:opacity-50 mb-3"
          >
            {busy === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={doAnon}
            disabled={!configured || busy !== null}
            className="w-full inline-flex items-center justify-center gap-3 bg-spotter-ink border border-spotter-line text-white font-semibold py-3 rounded-xl hover:bg-white/5 transition disabled:opacity-50 mb-5"
          >
            {busy === "anon" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            Continue as guest
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-spotter-line" />
            </div>
            <div className="relative flex justify-center text-xs text-spotter-mute">
              <span className="bg-spotter-panel px-3">or with email</span>
            </div>
          </div>

          <form onSubmit={doEmail} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-spotter-ink border border-spotter-line rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-spotter-cyan transition"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-spotter-ink border border-spotter-line rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-spotter-cyan transition"
            />
            {err && <div className="text-xs text-rose-400">{err}</div>}
            <button
              type="submit"
              disabled={!configured || busy !== null || !email || password.length < 6}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold py-3 rounded-xl hover:brightness-110 transition disabled:opacity-50"
            >
              {busy === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-spotter-mute mt-5">
            {mode === "signin" ? "Don't have an account?" : "Already have one?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-spotter-cyan hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-spotter-mute mt-6">
          By continuing you agree to our terms and privacy policy.
        </p>
      </motion.div>
    </main>
  );
}
