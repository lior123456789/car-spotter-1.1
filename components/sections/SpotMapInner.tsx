"use client";

import { useState } from "react";
import { Map, MapPopup, MapControls, MapClusterLayer } from "@/components/ui/mapcn-layer-markers";
import { SPOTS, spotsAsFeatureCollection, type Spot, type SpotKind } from "@/lib/spotData";

const KIND_COLORS: Record<SpotKind, string> = {
  Concours:  "#FFB020",
  Boulevard: "#FF7A2E",
  Auction:   "#A855F7",
  Track:     "#FF3D5A",
  Resort:    "#22D3EE",
  Dealer:    "#10B981",
  Show:      "#EC4899",
};

const ALL_KINDS = Object.keys(KIND_COLORS) as SpotKind[];

export function SpotMapInner() {
  const [selected, setSelected] = useState<Spot | null>(null);
  const [activeKinds, setActiveKinds] = useState<SpotKind[]>(ALL_KINDS);

  const filteredFeatures = spotsAsFeatureCollection();
  filteredFeatures.features = filteredFeatures.features.filter((f) =>
    activeKinds.includes((f.properties as Spot).kind),
  );

  const toggleKind = (k: SpotKind) =>
    setActiveKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  return (
    <>
      {/* Filter chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pt-4 pb-2 bg-spotter-panel/40">
        {ALL_KINDS.map((k) => {
          const active = activeKinds.includes(k);
          const count = SPOTS.filter((s) => s.kind === k).length;
          return (
            <button
              key={k}
              onClick={() => toggleKind(k)}
              className={[
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition",
                active
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-spotter-line text-spotter-mute hover:text-white",
              ].join(" ")}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: KIND_COLORS[k] }} />
              {k}
              <span className="text-[10px] text-spotter-mute">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="h-[560px] w-full relative">
        <Map theme="dark" center={[10, 35]} zoom={1.6} attributionControl={false}>
          <MapClusterLayer
            data={filteredFeatures}
            clusterRadius={50}
            clusterColors={["#22D3EE", "#A855F7", "#06B6D4"]}
            clusterThresholds={[5, 20]}
            pointColor="#22D3EE"
            onPointClick={(feature) => {
              setSelected(feature.properties as Spot);
            }}
          />

          {selected && (
            <MapPopup
              longitude={selected.lng}
              latitude={selected.lat}
              onClose={() => setSelected(null)}
              closeButton
              closeOnClick={false}
              focusAfterOpen={false}
              offset={14}
              className="!bg-spotter-panel !text-white !border-spotter-line !rounded-xl !p-0 !max-w-72 !overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: KIND_COLORS[selected.kind] }} />
                  <span className="text-[10px] uppercase tracking-widest text-spotter-mute">{selected.kind}</span>
                  {selected.tier === "iconic" && (
                    <span className="text-[9px] uppercase tracking-widest bg-spotter-orange/20 text-spotter-orange px-1.5 py-0.5 rounded">
                      Iconic
                    </span>
                  )}
                </div>
                <div className="font-semibold text-white">{selected.name}</div>
                <div className="text-xs text-spotter-mute mb-2">{selected.city}, {selected.country}</div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">{selected.blurb}</p>
                {selected.bestTime && (
                  <div className="text-[10px] uppercase tracking-widest text-spotter-orange mb-1">Best time</div>
                )}
                {selected.bestTime && <p className="text-xs text-zinc-200 mb-3">{selected.bestTime}</p>}
                <div className="text-[10px] uppercase tracking-widest text-spotter-orange mb-1">Recent sightings</div>
                <ul className="space-y-0.5 mb-2">
                  {selected.recentCars.map((c) => (
                    <li key={c} className="text-xs text-zinc-200">· {c}</li>
                  ))}
                </ul>
                <div className="text-[11px] text-spotter-mute pt-2 border-t border-spotter-line/60">
                  {selected.sightings.toLocaleString()} community sightings logged
                </div>
              </div>
            </MapPopup>
          )}

          <MapControls position="bottom-right" showZoom showCompass showLocate />
        </Map>
      </div>
    </>
  );
}
