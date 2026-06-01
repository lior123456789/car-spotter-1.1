import { NextResponse } from "next/server";

const SPOTS = [
  { id: "rodeo",      name: "Rodeo Drive",            city: "Beverly Hills, USA",  lng: -118.4051, lat: 34.0696, kind: "Boulevard", sightings: 1247 },
  { id: "pebble",     name: "Pebble Beach 17-Mile Dr",city: "Monterey, USA",       lng: -121.9519, lat: 36.5694, kind: "Concours",   sightings: 893 },
  { id: "monaco",     name: "Casino Square",          city: "Monte Carlo, Monaco", lng: 7.4288,    lat: 43.7396, kind: "Boulevard", sightings: 1602 },
  { id: "mayfair",    name: "Berkeley Square",        city: "London, UK",          lng: -0.1448,   lat: 51.5095, kind: "Boulevard", sightings: 1418 },
  { id: "dubai",      name: "Dubai Marina",           city: "Dubai, UAE",          lng: 55.1419,   lat: 25.0805, kind: "Boulevard", sightings: 2104 },
  { id: "goodwood",   name: "Goodwood Estate",        city: "West Sussex, UK",     lng: -0.7574,   lat: 50.8666, kind: "Track",     sightings: 967 },
  { id: "nurburgring",name: "Nürburgring",            city: "Nürburg, Germany",    lng: 6.9430,    lat: 50.3356, kind: "Track",     sightings: 1789 },
  { id: "miami",      name: "Ocean Drive",            city: "Miami Beach, USA",    lng: -80.1300,  lat: 25.7825, kind: "Boulevard", sightings: 1356 },
  { id: "stmoritz",   name: "Bahnhofstrasse",         city: "St. Moritz, CH",      lng: 9.8389,    lat: 46.4983, kind: "Resort",    sightings: 612 },
  { id: "aspen",      name: "Aspen Village",          city: "Aspen, USA",          lng: -106.8175, lat: 39.1911, kind: "Resort",    sightings: 547 },
  { id: "sttropez",   name: "Saint-Tropez Port",      city: "Saint-Tropez, France",lng: 6.6395,    lat: 43.2727, kind: "Resort",    sightings: 1102 },
  { id: "amelia",     name: "Amelia Island Concours", city: "Florida, USA",        lng: -81.4517,  lat: 30.6510, kind: "Concours",   sightings: 421 },
  { id: "tokyo",      name: "Daikoku Futō PA",        city: "Yokohama, Japan",     lng: 139.6850,  lat: 35.4540, kind: "Boulevard", sightings: 1893 },
  { id: "barcelona",  name: "Passeig de Gràcia",      city: "Barcelona, Spain",    lng: 2.1660,    lat: 41.3925, kind: "Boulevard", sightings: 638 },
  { id: "bat",        name: "BaT Auction Pickups",    city: "San Francisco, USA",  lng: -122.4194, lat: 37.7749, kind: "Auction",   sightings: 778 },
];

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ count: SPOTS.length, spots: SPOTS });
}
