"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin, Globe } from "lucide-react";
import { SPOTS, type Spot } from "@/lib/spotData";

const Map               = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.Map), { ssr: false });
const MapPopup          = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.MapPopup), { ssr: false });
const MapControls       = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.MapControls), { ssr: false });
const MapMarker         = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.MapMarker), { ssr: false });
const MarkerContent     = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.MarkerContent), { ssr: false });

/**
 * Map shown directly under the scan result card.
 * Highlights every Spot from lib/spotData.ts whose `recentCars` list
 * includes the make + model the user just identified — so the user
 * instantly sees where in the world that exact car has been spotted.
 * Falls back to showing all hotspots if no match found.
 */
export function ScanResultMap({
  make,
  model,
  category,
}: {
  make: string;
  model: string;
  category: string;
}) {
  const [selected, setSelected] = useState<Spot | null>(null);

  // Find spots that mention this specific car in their recentCars list.
  const matchingSpots = useMemo(() => {
    const needle = `${make} ${model}`.toLowerCase();
    const makeNeedle = make.toLowerCase();
    const exact: Spot[] = [];
    const related: Spot[] = [];
    for (const spot of SPOTS) {
      const cars = spot.recentCars.map((c) => c.toLowerCase());
      if (cars.some((c) => c.includes(needle) || needle.includes(c))) {
        exact.push(spot);
      } else if (cars.some((c) => c.includes(makeNeedle))) {
        related.push(spot);
      }
    }
    return { exact, related };
  }, [make, model]);

  const showFallback = matchingSpots.exact.length === 0 && matchingSpots.related.length === 0;
  const featuresToShow = showFallback ? SPOTS : [...matchingSpots.exact, ...matchingSpots.related.slice(0, 8)];

  return (
    <div className="mt-5 rounded-2xl border border-spotter-line bg-spotter-panel/50 overflow-hidden shadow-[0_-13px_180px_rgba(34,211,238,0.18)]">
      <div className="px-5 py-4 border-b border-spotter-line flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-spotter-cyan flex items-center gap-1.5 mb-0.5">
            <Globe className="w-3 h-3" /> Where to spot
          </div>
          <div className="text-lg font-semibold">
            {showFallback
              ? `Top global hotspots`
              : matchingSpots.exact.length > 0
              ? `${matchingSpots.exact.length} place${matchingSpots.exact.length > 1 ? "s" : ""} ${make} ${model}s have been spotted`
              : `${matchingSpots.related.length} ${make} hotspots worldwide`}
          </div>
        </div>
        <div className="text-xs text-spotter-mute">
          {featuresToShow.length} locations
        </div>
      </div>

      <div className="h-[420px] w-full relative">
        <Map theme="dark" center={[0, 30]} zoom={1.4} attributionControl={false}>
          {featuresToShow.map((s) => {
            const isExact = matchingSpots.exact.includes(s);
            return (
              <MapMarker key={`${s.name}-${s.lat}-${s.lng}`} longitude={s.lng} latitude={s.lat} onClick={() => setSelected(s)}>
                <MarkerContent>
                  <button
                    aria-label={s.name}
                    className="relative grid place-items-center cursor-pointer"
                    style={{ width: 22, height: 22 }}
                  >
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: isExact ? "#22D3EE" : "#A855F7", opacity: 0.35 }}
                    />
                    <span
                      className="rounded-full border-2 border-white"
                      style={{
                        width: 13, height: 13,
                        background: isExact ? "#22D3EE" : "#A855F7",
                        boxShadow: `0 0 12px ${isExact ? "#22D3EE" : "#A855F7"}`,
                      }}
                    />
                  </button>
                </MarkerContent>
              </MapMarker>
            );
          })}

          {selected && (
            <MapPopup
              longitude={selected.lng}
              latitude={selected.lat}
              onClose={() => setSelected(null)}
              closeButton
              closeOnClick={false}
              focusAfterOpen={false}
              offset={14}
              className="!bg-spotter-panel !text-white !border-spotter-line !rounded-xl !p-0 !max-w-72"
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-spotter-cyan" />
                  <span className="text-[10px] uppercase tracking-widest text-spotter-mute">{selected.kind}</span>
                  {selected.tier === "iconic" && (
                    <span className="text-[9px] uppercase tracking-widest bg-spotter-cyan/20 text-spotter-cyan px-1.5 py-0.5 rounded">
                      Iconic
                    </span>
                  )}
                </div>
                <div className="font-semibold text-white">{selected.name}</div>
                <div className="text-xs text-spotter-mute mb-2">{selected.city}, {selected.country}</div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">{selected.blurb}</p>
                {selected.bestTime && (
                  <div className="text-[10px] uppercase tracking-widest text-spotter-cyan mb-1">Best time</div>
                )}
                {selected.bestTime && <p className="text-xs text-zinc-200 mb-3">{selected.bestTime}</p>}
                <div className="text-[10px] uppercase tracking-widest text-spotter-cyan mb-1">Recently spotted</div>
                <ul className="space-y-0.5 mb-2">
                  {selected.recentCars.slice(0, 4).map((c) => (
                    <li key={c} className="text-xs text-zinc-200">· {c}</li>
                  ))}
                </ul>
                <div className="text-[11px] text-spotter-mute pt-2 border-t border-spotter-line/60">
                  {selected.sightings.toLocaleString()} community sightings
                </div>
              </div>
            </MapPopup>
          )}

          <MapControls position="bottom-right" showZoom showCompass showLocate />
        </Map>
      </div>

      <div className="px-5 py-3 border-t border-spotter-line bg-spotter-ink/40 text-xs text-spotter-mute flex items-center gap-2">
        <MapPin className="w-3 h-3 text-spotter-cyan" />
        Tap a pin to see when & where this car has been spotted.
        {!showFallback && matchingSpots.exact.length === 0 && (
          <span>No direct matches yet — showing other {make} hotspots.</span>
        )}
      </div>
    </div>
  );
}
