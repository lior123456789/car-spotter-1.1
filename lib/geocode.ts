/**
 * Lightweight known-place geocoder. Maps free-text "location" strings
 * to lng/lat. Covers every spotting hotspot in lib/spotData.ts + major
 * world metros. No external API needed.
 */
export const KNOWN_PLACES: Record<string, [number, number]> = {
  "rodeo": [-118.4051, 34.0696], "beverly hills": [-118.4051, 34.0696],
  "pebble beach": [-121.9519, 36.5694], "monterey": [-121.9519, 36.5694],
  "monaco": [7.4288, 43.7396], "monte carlo": [7.4288, 43.7396],
  "mayfair": [-0.1448, 51.5095], "london": [-0.1276, 51.5074],
  "miami": [-80.13, 25.7825], "miami beach": [-80.13, 25.7825],
  "wynwood": [-80.1991, 25.8010],
  "dubai": [55.1419, 25.0805], "dubai marina": [55.1419, 25.0805],
  "abu dhabi": [54.3171, 24.4615],
  "doha": [51.5505, 25.3683],
  "riyadh": [46.6743, 24.7117],
  "tokyo": [139.685, 35.454], "yokohama": [139.685, 35.454],
  "daikoku": [139.685, 35.454],
  "shanghai": [121.4906, 31.24],
  "seoul": [127.0276, 37.4979],
  "singapore": [103.8607, 1.2834],
  "goodwood": [-0.7574, 50.8666],
  "nurburg": [6.943, 50.3356], "nürburgring": [6.943, 50.3356],
  "spa": [5.9714, 50.4372],
  "geneva": [6.108, 46.2353],
  "st moritz": [9.8389, 46.4983], "st. moritz": [9.8389, 46.4983],
  "st tropez": [6.6395, 43.2727], "saint-tropez": [6.6395, 43.2727],
  "marbella": [-4.9526, 36.4848],
  "milan": [9.1947, 45.4685],
  "modena": [10.9252, 44.6471], "maranello": [10.9252, 44.6471],
  "barcelona": [2.166, 41.3925],
  "aspen": [-106.8175, 39.1911],
  "scottsdale": [-111.9261, 33.4734],
  "amelia island": [-81.4517, 30.651],
  "naples": [-81.7948, 26.142],
  "hamptons": [-72.1846, 40.9634],
  "greenwich": [-73.6273, 41.0262],
  "atlanta": [-84.388, 33.749],
  "houston": [-95.3698, 29.7604],
  "chicago": [-87.6234, 41.895],
  "boston": [-71.0589, 42.3601],
  "seattle": [-122.2034, 47.6101],
  "newport beach": [-117.8745, 33.6188],
  "los angeles": [-118.2437, 34.0522], "la": [-118.2437, 34.0522],
  "new york": [-74.006, 40.7128], "nyc": [-74.006, 40.7128],
  "san francisco": [-122.4194, 37.7749],
  "paris": [2.3522, 48.8566],
  "rome": [12.4964, 41.9028],
  "berlin": [13.405, 52.52], "munich": [11.582, 48.1351],
  "amsterdam": [4.8951, 52.3702],
  "zurich": [8.5417, 47.3769],
  "vienna": [16.3738, 48.2082],
  "madrid": [-3.7038, 40.4168],
  "lisbon": [-9.1393, 38.7223],
  "sydney": [151.2093, -33.8688],
  "melbourne": [144.9631, -37.8136],
};

export function geocode(loc?: string): [number, number] | null {
  if (!loc) return null;
  const lc = loc.toLowerCase().trim();
  for (const [key, coords] of Object.entries(KNOWN_PLACES)) {
    if (lc.includes(key)) return coords;
  }
  return null;
}
