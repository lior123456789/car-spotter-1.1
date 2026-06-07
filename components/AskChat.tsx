"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "What's the most reliable used sports car under $40k?",
  "Is a Porsche 911 a good investment?",
  "Explain cap rate vs. depreciation for a car.",
  "What makes a car 'rare'?",
];

export function AskChat({ car }: { car?: Record<string, unknown> }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setBusy(true);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ car: car ?? {}, messages: next }),
      });
      const d = await r.json();
      setMessages((m) => [...m, { role: "assistant", content: d.answer ?? d.error ?? "Try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "AI is busy — try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-spotter-line bg-spotter-panel overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-spotter-line">
        <Sparkles className="w-4 h-4 text-spotter-cyan" />
        <span className="font-semibold text-sm">CarSpotter AI</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[55vh]">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">Ask me anything about cars — specs, values, buying advice, history.</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs text-spotter-cyan border border-spotter-cyan/30 bg-spotter-cyan/5 rounded-full px-3 py-1.5 hover:bg-spotter-cyan/10 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                (m.role === "user"
                  ? "bg-gradient-to-r from-spotter-orange to-spotter-red text-spotter-ink font-medium"
                  : "bg-black/40 border border-spotter-line text-white")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-black/40 border border-spotter-line rounded-2xl px-4 py-2.5 text-zinc-500 text-lg">…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-spotter-line">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
          placeholder="Ask a question…"
          className="flex-1 min-w-0 bg-black/40 border border-spotter-line rounded-full px-4 py-2.5 text-sm outline-none focus:border-spotter-cyan"
        />
        <button
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
          className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-r from-spotter-orange to-spotter-red disabled:opacity-40 hover:brightness-110 transition"
          aria-label="Send"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
