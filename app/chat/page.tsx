"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getUserProfile } from "@/lib/firebase";
import { AskChat } from "@/components/AskChat";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [plan, setPlan] = useState<string | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setPlanLoaded(true); return; }
      try {
        const p = await getUserProfile(user.uid);
        if (active) setPlan(p?.plan ?? "free");
      } catch { if (active) setPlan("free"); }
      finally { if (active) setPlanLoaded(true); }
    })();
    return () => { active = false; };
  }, [user]);

  const unlocked = plan === "collector" || plan === "concours";

  return (
    <main className="min-h-screen bg-spotter-ink text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-spotter-ink/70 border-b border-spotter-line">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spotter-orange to-spotter-red grid place-items-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">CarSpotter</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-zinc-300">
            <Link href="/#pricing" className="hover:text-white">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-12">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">CarSpotter AI</h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider px-2 py-1 rounded-full border border-spotter-cyan/40 text-spotter-cyan">
            <Sparkles className="w-3 h-3" /> COLLECTOR
          </span>
        </div>
        <p className="text-zinc-400 mb-8">Your AI car expert — ask anything about any car.</p>

        {(loading || !planLoaded) ? (
          <div className="text-zinc-500">Loading…</div>
        ) : !user ? (
          <Gate title="Sign in to use CarSpotter AI" body="The AI chat is part of Collector and Concours. Sign in to continue." cta="Sign in" href="/signin" />
        ) : !unlocked ? (
          <Gate title="CarSpotter AI is a Collector feature" body="Unlimited AI car questions are included with Collector and Concours. Upgrade to unlock." cta="Upgrade" href="/#pricing" />
        ) : (
          <AskChat />
        )}
      </div>
    </main>
  );
}

function Gate({ title, body, cta, href }: { title: string; body: string; cta: string; href: string }) {
  return (
    <div className="rounded-2xl border border-spotter-line bg-spotter-panel p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-spotter-orange to-spotter-red grid place-items-center mx-auto mb-5">
        <Lock className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-zinc-400 max-w-sm mx-auto mb-6">{body}</p>
      <Link href={href} className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-orange to-spotter-red text-white font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition">
        {cta}
      </Link>
    </div>
  );
}
