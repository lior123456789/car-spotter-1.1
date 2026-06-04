"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Crown, MapPin } from "lucide-react";
import type { UserScan } from "@/lib/firestoreClient";

const Map         = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.Map),         { ssr: false });
const MapMarker   = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.MapMarker),   { ssr: false });
const MarkerContent = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.MarkerContent), { ssr: false });
const MapPopup    = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.MapPopup),    { ssr: false });
const MapControls = dynamic(() => import("@/components/ui/mapcn-layer-markers").then((m) => m.MapControls), { ssr: false });

type LocatedScan = UserScan & { lng: number; lat: number };

/** Naive geocoder for the location string. Real implementation would
 * hit Mapbox Geocoding API — for MVP, recognize the common spotting
 * locations from lib/spotData.ts directly. */
const KNOWN_PLACES: Record<string, [number, number]> = {
  "rodeo": [-118.4051, 34.0696],
  "beverly hills": [-118.4051, 34.0696],
  "pebble beach": [-121.9519, 36.5694],
  "monaco": [7.4288, 43.7396],
  "monte carlo": [7.4288, 43.7396],
  "london": [-0.1448, 51.5095],
  "mayfair": [-0.1448, 51.5095],
  "miami": [-80.13, 25.7825],
  "dubai": [55.1419, 25.0805],
  "tokyo": [139.685, 35.454],
  "yokohama": [139.685, 35.454],
  "los angeles": [-118.2437, 34.0522],
  "new york": [-74.006, 40.7128],
  "san francisco": [-122.4194, 37.7749],
  "paris": [2.3522, 48.8566],
  "milan": [9.1947, 45.4685],
  "rome": [12.4964, 41.9028],
  "barcelona": [2.166, 41.3925],
  "berlin": [13.405, 52.52],
  "munich": [11.582, 48.1351],
  "amsterdam": [4.8951, 52.3702],
  "singapore": [103.8607, 1.2834],
  "geneva": [6.108, 46.2353],
  "zurich": [8.5417, 47.3769],
  "marbella": [-4.9526, 36.4848],
  "barcelona spain": [2.166, 41.3925],
};

function geocode(loc?: string): [number, number] | null {
  if (!loc) return null;
  const lc = loc.toLowerCase();
  for (const [key, coords] of Object.entries(KNOWN_PLACES)) {
    if (lc.includes(key)) return coords;
  }
  return null;
}

export function DashboardMap({
  scans,
  plan,
}: {
  scans: UserScan[];
  plan: string;
}) {
  const isPaid = plan !== "free";
  const [selected, setSelected] = useState<LocatedScan | null>(null);
  const [locatedScans, setLocatedScans] = useState<LocatedScan[]>([]);

  useEffect(() => {
    const located: LocatedScan[] = [];
    for (const s of scans) {
      const coords = geocode(s.location);
      if (coords) located.push({ ...s, lng: coords[0], lat: coords[1] });
    }
    setLocatedScans(located);
  }, [scans]);

  if (!isPaid) {
    return (
      <div className="relative rounded-2xl border border-spotter-cyan/30 bg-gradient-to-br from-spotter-cyan/10 to-spotter-violet/5 p-8 text-center my-8 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(34,211,238,0.4), transparent 60%), radial-gradient(circle at 70% 70%, rgba(168,85,247,0.4), transparent 60%)",
          }}
        />
        <div className="relative">
          <Crown className="w-8 h-8 text-spotter-cyan mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">Your personal Spot Map</h3>
          <p className="text-sm text-spotter-mute mb-5 max-w-sm mx-auto">
            See every car you've identified plotted on a world map. Available to Collector and Concours plans.
          </p>
          <a
            href="/#pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition text-sm"
          >
            <Crown className="w-4 h-4" /> Upgrade to unlock
          </a>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-spotter-line bg-spotter-panel/50 overflow-hidden my-8"
    >
      <div className="px-5 py-4 border-b border-spotter-line flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-spotter-mute flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-spotter-cyan" /> {plan.charAt(0).toUpperCase() + plan.slice(1)} feature
          </div>
          <div className="text-lg font-semibold">Your spot map</div>
        </div>
        <div className="text-xs text-spotter-mute">
          {locatedScans.length} / {scans.length} mapped
        </div>
      </div>
      {scans.length === 0 ? (
        <p className="p-8 text-center text-sm text-spotter-mute">
          Scan a car to see it appear on your map.
        </p>
      ) : locatedScans.length === 0 ? (
        <p className="p-8 text-center text-sm text-spotter-mute">
          Add a location to your scans (Rodeo Drive, Monaco, Dubai…) to plot them here.
        </p>
      ) : (
        <div className="h-[440px] relative">
          <Map theme="dark" center={[0, 30]} zoom={1.4} attributionControl={false}>
            {locatedScans.map((s) => (
              <MapMarker
                key={s.id}
                longitude={s.lng}
                latitude={s.lat}
                onClick={() => setSelected(s)}
              >
                <MarkerContent>
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: "#22D3EE", opacity: 0.4 }}
                    />
                    <span
                      className="relative block w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg"
                      style={{ background: "#22D3EE" }}
                    />
                  </div>
                </MarkerContent>
              </MapMarker>
            ))}

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
                  <div className="text-[10px] uppercase tracking-widest text-spotter-cyan mb-1">{selected.category}</div>
                  <div className="font-semibold text-white">
                    {selected.year} {selected.make} {selected.model}
                  </div>
                  <div className="text-xs text-spotter-mute flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {selected.location}
                  </div>
                  <div className="text-xs text-spotter-mute mt-2">
                    {selected.spottedAt.toLocaleDateString()}
                  </div>
                  <div className="mt-2 text-xs gradient-text font-semibold">{selected.valueRange}</div>
                </div>
              </MapPopup>
            )}

            <MapControls position="bottom-right" showZoom showCompass />
          </Map>
        </div>
      )}
    </motion.div>
  );
}
