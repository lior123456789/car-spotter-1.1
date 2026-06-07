"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Lock, Search, Crown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getUserProfile } from "@/lib/firebase";

export default function DecoderPage() {
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

  const isConcours = plan === "concours";

  return (
    <main className="min-h-screen bg-spotter-ink text-white">
      <Header />
      <div className="max-w-3xl mx-auto px-5 py-12">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Decoder</h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider px-2 py-1 rounded-full border border-spotter-red/40 text-spotter-red">
            <Crown className="w-3 h-3" /> CONCOURS
          </span>
        </div>
        <p className="text-zinc-400 mb-8">
          Decode any VIN or US license plate into full vehicle specs — make, model, year, value, and more.
        </p>

        {(loading || !planLoaded) ? (
          <div className="text-zinc-500">Loading…</div>
        ) : !user ? (
          <Gate
            title="Sign in to use the Decoder"
            body="The Decoder is part of the Concours plan. Sign in to continue."
            cta="Sign in"
            href="/signin"
          />
        ) : !isConcours ? (
          <Gate
            title="Decoder is a Concours feature"
            body="VIN + license-plate decoding is included with Concours. Upgrade to unlock it."
            cta="Upgrade to Concours"
            href="/#pricing"
          />
        ) : (
          <div className="space-y-8">
            <VinDecoder />
            <PlateDecoder />
          </div>
        )}
      </div>
    </main>
  );
}

function Header() {
  return (
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
      <Link
        href={href}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-orange to-spotter-red text-white font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition"
      >
        {cta}
      </Link>
    </div>
  );
}

type Row = [string, string | undefined];

function ResultCard({ title, subtitle, rows }: { title: string; subtitle?: string; rows: Row[] }) {
  const shown = rows.filter(([, v]) => v && String(v).trim() && String(v) !== "—");
  return (
    <div className="rounded-2xl border border-spotter-line bg-spotter-panel p-6 mt-4">
      <div className="text-2xl font-bold">{title}</div>
      {subtitle && <div className="text-spotter-cyan text-sm mt-0.5">{subtitle}</div>}
      <div className="h-px bg-spotter-line my-4" />
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {shown.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-sm">
            <dt className="text-zinc-500 uppercase tracking-wide text-xs pt-0.5">{k}</dt>
            <dd className="text-white font-medium text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function VinDecoder() {
  const [vin, setVin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<any>(null);

  async function go() {
    setErr(null); setRes(null); setBusy(true);
    try {
      const r = await fetch(`/api/vin-decode?vin=${encodeURIComponent(vin.trim())}`);
      const d = await r.json();
      if (!d.success) setErr(d.error ?? "No match for that VIN.");
      else setRes(d.attributes ?? d);
    } catch { setErr("Lookup failed. Try again."); }
    finally { setBusy(false); }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">VIN Decoder</h2>
      <div className="flex gap-2">
        <input
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          placeholder="WBAFR7C57CC811956"
          className="flex-1 min-w-0 bg-black/40 border border-spotter-line rounded-xl px-4 py-3 font-mono tracking-wider outline-none focus:border-spotter-cyan"
        />
        <button
          onClick={go}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-orange to-spotter-red font-semibold px-5 py-3 rounded-xl hover:brightness-110 transition disabled:opacity-50"
        >
          <Search className="w-4 h-4" /> {busy ? "…" : "Decode"}
        </button>
      </div>
      {err && <p className="text-red-400 text-sm mt-2">{err}</p>}
      {res && (
        <ResultCard
          title={[res.year, res.make, res.model].filter(Boolean).join(" ") || "Vehicle"}
          subtitle={res.trim || res.style}
          rows={[
            ["Engine", res.engine],
            ["Fuel", res.fuel_type],
            ["Made in", res.made_in],
            ["Body", res.style],
            ["Fuel capacity", res.fuel_capacity],
            ["City MPG", res.city_mileage],
            ["Highway MPG", res.highway_mileage],
          ]}
        />
      )}
    </section>
  );
}

const US_STATES = "AL,AK,AZ,AR,CA,CO,CT,DE,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY,DC".split(",");

function PlateDecoder() {
  const [plate, setPlate] = useState("");
  const [state, setState] = useState("CA");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<any>(null);

  async function go() {
    setErr(null); setRes(null); setBusy(true);
    try {
      const r = await fetch(`/api/plate-decode?plate=${encodeURIComponent(plate.trim())}&state=${state}&country=US`);
      const d = await r.json();
      if (!d.success) setErr(d.error ?? "No match for that plate.");
      else setRes(d);
    } catch { setErr("Lookup failed. Try again."); }
    finally { setBusy(false); }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">License Plate Decoder</h2>
      <div className="flex gap-2">
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder="7XER187"
          className="flex-1 min-w-0 bg-black/40 border border-spotter-line rounded-xl px-4 py-3 font-mono tracking-wider outline-none focus:border-spotter-cyan"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="bg-black/40 border border-spotter-line rounded-xl px-3 py-3 outline-none focus:border-spotter-cyan"
        >
          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={go}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-orange to-spotter-red font-semibold px-5 py-3 rounded-xl hover:brightness-110 transition disabled:opacity-50"
        >
          <Search className="w-4 h-4" /> {busy ? "…" : "Decode"}
        </button>
      </div>
      {err && <p className="text-red-400 text-sm mt-2">{err}</p>}
      {res && (
        <ResultCard
          title={[res.year, res.make, res.model].filter(Boolean).join(" ") || res.description || "Vehicle"}
          subtitle={res.trim || res.style}
          rows={[
            ["VIN", res.vin],
            ["Body", res.body_style || res.style],
            ["Engine", res.engine || res.engine_size],
            ["Fuel", res.fuel_type],
            ["Drive", res.drive_type],
            ["Transmission", res.transmission],
            ["Color", res.color],
            ["Assembly", res.assembly],
          ]}
        />
      )}
    </section>
  );
}
