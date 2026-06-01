"use client";

import { useState } from "react";
import { Map, MapMarker, MarkerContent, MapPopup, MapControls } from "@/components/ui/mapcn-layer-markers";

type SpotKind = "Concours" | "Boulevard" | "Auction" | "Track" | "Resort";

type Spot = {
  id: string;
  name: string;
  city: string;
  lng: number;
  lat: number;
  kind: SpotKind;
  blurb: string;
  cars: string[];
  sightings: number;
};

const SPOTS: Spot[] = [
  { id: "rodeo",      name: "Rodeo Drive",            city: "Beverly Hills, USA",  lng: -118.4051, lat: 34.0696, kind: "Boulevard", blurb: "The original supercar boulevard. Saturday afternoons are essentially a free auto show.", cars: ["Bugatti Chiron", "Ferrari SF90", "Rolls Royce Phantom"], sightings: 1247 },
  { id: "pebble",     name: "Pebble Beach 17-Mile Dr",city: "Monterey, USA",       lng: -121.9519, lat: 36.5694, kind: "Concours",   blurb: "Concours d'Elegance every August. The greatest concentration of priceless coachbuilt cars on Earth.", cars: ["1937 Bugatti Atlantic", "Ferrari 250 GTO", "Mercedes 300SLR"], sightings: 893 },
  { id: "monaco",     name: "Casino Square",          city: "Monte Carlo, Monaco", lng: 7.4288,    lat: 43.7396, kind: "Boulevard", blurb: "Where every parked car costs more than a house. Loop the casino at sunset.", cars: ["Pagani Huayra", "Koenigsegg Jesko", "Ferrari Daytona SP3"], sightings: 1602 },
  { id: "mayfair",    name: "Berkeley Square",        city: "London, UK",          lng: -0.1448,   lat: 51.5095, kind: "Boulevard", blurb: "Mayfair's open-air supercar paddock — gold-wrapped Bugattis, gulf-state plates, the whole show.", cars: ["Bugatti Veyron", "Lamborghini Aventador SVJ", "Aston Martin Valkyrie"], sightings: 1418 },
  { id: "dubai",      name: "Dubai Marina",           city: "Dubai, UAE",          lng: 55.1419,   lat: 25.0805, kind: "Boulevard", blurb: "Marina Walk after dark — Bugattis with neon underglow, Lamborghinis on hydraulics.", cars: ["Bugatti Chiron Pur Sport", "McLaren P1", "Mansory G-Class"], sightings: 2104 },
  { id: "goodwood",   name: "Goodwood Estate",        city: "West Sussex, UK",     lng: -0.7574,   lat: 50.8666, kind: "Track",     blurb: "Festival of Speed (June) + Revival (Sept). Hillclimb run by anything from a 1908 Mercedes to a Le Mans hypercar.", cars: ["McLaren F1", "Ferrari F40", "Porsche 917"], sightings: 967 },
  { id: "nurburgring",name: "Nürburgring Nordschleife",city: "Nürburg, Germany",   lng: 6.9430,    lat: 50.3356, kind: "Track",     blurb: "Touristenfahrten days — anyone with €30 can drive the Green Hell. Spotter's paradise in the parking lot.", cars: ["Porsche GT3 RS", "Nissan GT-R Nismo", "BMW M4 CSL"], sightings: 1789 },
  { id: "miami",      name: "Ocean Drive",            city: "Miami Beach, USA",    lng: -80.1300,  lat: 25.7825, kind: "Boulevard", blurb: "Friday/Saturday nights. Lambo Trucks, chromed-out Rolls Royce, every flavor of Lambo on Collins.", cars: ["Lamborghini Urus", "Rolls Royce Cullinan", "Ferrari Purosangue"], sightings: 1356 },
  { id: "stmoritz",   name: "Bahnhofstrasse Lots",    city: "St. Moritz, CH",      lng: 9.8389,    lat: 46.4983, kind: "Resort",    blurb: "Winter season — every Swiss/German/Italian collector parks here in studded-tire supercars.", cars: ["Ferrari 812 GTS", "Bentley Bacalar", "Porsche 911 Dakar"], sightings: 612 },
  { id: "aspen",      name: "Aspen Mountain Village", city: "Aspen, USA",          lng: -106.8175, lat: 39.1911, kind: "Resort",    blurb: "Christmas week — supercars on snow tires, valets parking $3M cars in the Little Nell.", cars: ["Porsche 911 GT3", "Lamborghini Huracán Sterrato", "Range Rover SV"], sightings: 547 },
  { id: "sttropez",   name: "Saint-Tropez Old Port",  city: "Saint-Tropez, France",lng: 6.6395,    lat: 43.2727, kind: "Resort",    blurb: "August. Place des Lices, the Pampelonne road, every yacht owner brings their summer car.", cars: ["Ferrari Roma", "Aston Martin DBX 707", "Pagani Utopia"], sightings: 1102 },
  { id: "amelia",     name: "Amelia Island Concours", city: "Florida, USA",        lng: -81.4517,  lat: 30.6510, kind: "Concours",   blurb: "March every year. Smaller than Pebble, but the cars are just as serious.", cars: ["Mercedes 300SL Gullwing", "Ferrari 275 GTB", "Duesenberg SJ"], sightings: 421 },
  { id: "tokyo",      name: "Daikoku Futō PA",        city: "Yokohama, Japan",     lng: 139.6850,  lat: 35.4540, kind: "Boulevard", blurb: "Late-night meets in the parking area. JDM heaven — every Skyline GT-R generation in one place.", cars: ["Nissan R34 GT-R V-Spec", "Toyota Supra A80", "Honda NSX-R"], sightings: 1893 },
  { id: "barcelona",  name: "Passeig de Gràcia",      city: "Barcelona, Spain",    lng: 2.1660,    lat: 41.3925, kind: "Boulevard", blurb: "Friday evenings — the Ferrari/Lamborghini dealerships are 200m apart and everything ends up on this street.", cars: ["Lamborghini Revuelto", "Ferrari 296 GTB", "Aston Martin Vantage"], sightings: 638 },
  { id: "bat",        name: "BaT Auction Pickups",    city: "San Francisco, USA",  lng: -122.4194, lat: 37.7749, kind: "Auction",   blurb: "Bring a Trailer HQ + Bay-Area collector pickups. Every Tuesday a new fresh import shows up.", cars: ["Porsche 964 Carrera RS", "BMW E30 M3 Sport Evo", "Honda NSX Type R"], sightings: 778 },
];

const KIND_COLORS: Record<SpotKind, string> = {
  Concours:  "#FFB020",
  Boulevard: "#FF7A2E",
  Auction:   "#A855F7",
  Track:     "#FF3D5A",
  Resort:    "#22D3EE",
};

export function SpotMapInner() {
  const [selected, setSelected] = useState<Spot | null>(null);
  const [activeKinds, setActiveKinds] = useState<SpotKind[]>(["Concours", "Boulevard", "Auction", "Track", "Resort"]);

  const visible = SPOTS.filter((s) => activeKinds.includes(s.kind));
  const toggleKind = (k: SpotKind) =>
    setActiveKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  return (
    <>
      {/* Filter chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-4 pt-4 pb-2 bg-spotter-panel/40">
        {(Object.keys(KIND_COLORS) as SpotKind[]).map((k) => {
          const active = activeKinds.includes(k);
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
            </button>
          );
        })}
      </div>

      <div className="h-[520px] w-full relative">
        <Map theme="dark" center={[10, 35]} zoom={1.6} attributionControl={false}>
          {visible.map((s) => (
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
                    style={{ background: KIND_COLORS[s.kind], opacity: 0.4 }}
                  />
                  <span
                    className="relative block w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg"
                    style={{ background: KIND_COLORS[s.kind] }}
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
              className="!bg-spotter-panel !text-white !border-spotter-line !rounded-xl !p-0 !max-w-72 !overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: KIND_COLORS[selected.kind] }} />
                  <span className="text-[10px] uppercase tracking-widest text-spotter-mute">{selected.kind}</span>
                </div>
                <div className="font-semibold text-white">{selected.name}</div>
                <div className="text-xs text-spotter-mute mb-2">{selected.city}</div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">{selected.blurb}</p>
                <div className="text-[10px] uppercase tracking-widest text-spotter-orange mb-1">Recent sightings</div>
                <ul className="space-y-0.5 mb-2">
                  {selected.cars.map((c) => (
                    <li key={c} className="text-xs text-zinc-200">· {c}</li>
                  ))}
                </ul>
                <div className="text-[11px] text-spotter-mute pt-2 border-t border-spotter-line/60">
                  {selected.sightings.toLocaleString()} community sightings logged
                </div>
              </div>
            </MapPopup>
          )}

          <MapControls position="bottom-right" showZoom showCompass />
        </Map>
      </div>
    </>
  );
}
