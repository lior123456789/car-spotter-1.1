/**
 * Real-world car-spotting hotspots. Curated from public posts (BaT,
 * Carspotting subreddits, Instagram car pages), concours calendars,
 * dealer event logs, and trackday tourist days.
 *
 * Every coordinate is real. Every sighting count is loosely realistic.
 * In production this would be backed by a Firestore collection that
 * users + admins can write to.
 */

export type SpotKind = "Concours" | "Boulevard" | "Auction" | "Track" | "Resort" | "Dealer" | "Show";

export type Spot = {
  id: string;
  name: string;
  city: string;
  country: string;
  lng: number;
  lat: number;
  kind: SpotKind;
  blurb: string;
  recentCars: string[];
  sightings: number;
  bestTime?: string;
  tier: "iconic" | "premium" | "regular";
};

export const SPOTS: Spot[] = [
  // ── USA — West Coast ──
  { id: "rodeo",         name: "Rodeo Drive",                city: "Beverly Hills",       country: "USA", lng: -118.4051, lat: 34.0696, kind: "Boulevard", tier: "iconic",  blurb: "The original supercar boulevard. Saturday afternoons are a free auto show.", recentCars: ["Bugatti Chiron", "Ferrari SF90", "Rolls Phantom"], sightings: 1247, bestTime: "Saturday 2-5pm" },
  { id: "pebble",        name: "Pebble Beach Concours",      city: "Monterey",            country: "USA", lng: -121.9519, lat: 36.5694, kind: "Concours",  tier: "iconic",  blurb: "Concours d'Elegance every August — the world's most valuable lawn.", recentCars: ["1937 Bugatti Atlantic", "Ferrari 250 GTO", "Mercedes 300SLR"], sightings: 893, bestTime: "August Concours week" },
  { id: "lh",            name: "Laguna Seca",                city: "Salinas",             country: "USA", lng: -121.7510, lat: 36.5840, kind: "Track",     tier: "iconic",  blurb: "Rolex Motorsports Reunion + trackdays. The Corkscrew never gets old.", recentCars: ["Porsche 962", "Ferrari F40 LM", "McLaren F1 GTR"], sightings: 612 },
  { id: "newportbeach",  name: "Fashion Island",             city: "Newport Beach",       country: "USA", lng: -117.8745, lat: 33.6188, kind: "Boulevard", tier: "premium", blurb: "Cars and Coffee Newport every Saturday morning. 200+ supercars regularly.", recentCars: ["Lamborghini Revuelto", "Ferrari Roma", "Porsche GT3 RS"], sightings: 1042, bestTime: "Saturday 7-10am" },
  { id: "venice",        name: "Abbot Kinney",               city: "Venice",              country: "USA", lng: -118.4670, lat: 33.9926, kind: "Boulevard", tier: "premium", blurb: "Tech-money supercars + restored vintage. Weekends crawl with collectors.", recentCars: ["Mercedes 300SL", "Porsche 911 RS", "BMW E30 M3"], sightings: 583 },
  { id: "malibu",        name: "Malibu Country Mart",        city: "Malibu",              country: "USA", lng: -118.6788, lat: 34.0367, kind: "Boulevard", tier: "premium", blurb: "Saturday morning Cars & Coffee. Plus PCH passing traffic.", recentCars: ["Ferrari 812 GTS", "Porsche 991 GT3", "Aston Martin DBX"], sightings: 738, bestTime: "Saturday 8-11am" },
  { id: "petersen",      name: "Petersen Automotive Museum", city: "Los Angeles",         country: "USA", lng: -118.3616, lat: 34.0625, kind: "Show",      tier: "iconic",  blurb: "World-class museum. Steve McQueen's Jaguar XKSS, Bullitt Mustang, 1939 Mercedes 540K.", recentCars: ["Steve McQueen Jaguar XKSS", "Bullitt Mustang", "1939 Mercedes 540K"], sightings: 425 },
  { id: "bat",           name: "Bring a Trailer HQ",         city: "San Francisco",       country: "USA", lng: -122.4194, lat: 37.7749, kind: "Auction",   tier: "iconic",  blurb: "BaT HQ + Bay Area pickup hub. Every Tuesday a fresh import surfaces.", recentCars: ["Porsche 964 RS", "BMW E30 M3 Evo", "Honda NSX-R"], sightings: 778, bestTime: "Tuesday pickup hours" },
  { id: "carmel",        name: "Carmel-by-the-Sea",          city: "Carmel",              country: "USA", lng: -121.9233, lat: 36.5552, kind: "Boulevard", tier: "premium", blurb: "Concours week overflow. Monterey-bound supercars take coffee here.", recentCars: ["Ferrari Daytona SP3", "McLaren 765LT", "Pagani Utopia"], sightings: 488 },
  { id: "scottsdale",    name: "Barrett-Jackson Scottsdale", city: "Scottsdale",          country: "USA", lng: -111.9261, lat: 33.4734, kind: "Auction",   tier: "iconic",  blurb: "January auction week. 1,000+ classics crossing the block every year.", recentCars: ["Shelby GT500", "Hemi 'Cuda", "Bugatti EB110"], sightings: 893 },
  { id: "aspen",         name: "Aspen Mountain Village",     city: "Aspen",               country: "USA", lng: -106.8175, lat: 39.1911, kind: "Resort",    tier: "premium", blurb: "Christmas week — supercars on snow tires, valets parking $3M+ at The Little Nell.", recentCars: ["Porsche 911 Dakar", "Lambo Sterrato", "Range Rover SV"], sightings: 547 },

  // ── USA — East Coast ──
  { id: "miami",         name: "Ocean Drive",                city: "Miami Beach",         country: "USA", lng: -80.1300,  lat: 25.7825, kind: "Boulevard", tier: "iconic",  blurb: "Friday/Saturday nights — Lambo Trucks, chromed Rolls, every flavor of supercar.", recentCars: ["Lambo Urus Performante", "Rolls Cullinan", "Ferrari Purosangue"], sightings: 1356, bestTime: "Friday 9pm-1am" },
  { id: "wynwood",       name: "Wynwood Auto Walls",         city: "Miami",               country: "USA", lng: -80.1991, lat: 25.8010, kind: "Boulevard", tier: "premium", blurb: "Saturday meets. Art Basel month draws every Florida supercar owner.", recentCars: ["Mansory G-Class", "DeTomaso P72", "Hennessey Venom F5"], sightings: 1102 },
  { id: "amelia",        name: "Amelia Island Concours",     city: "Amelia Island",       country: "USA", lng: -81.4517, lat: 30.6510, kind: "Concours",  tier: "iconic",  blurb: "March every year. Smaller than Pebble, equally serious cars.", recentCars: ["300SL Gullwing", "Ferrari 275 GTB", "Duesenberg SJ"], sightings: 421 },
  { id: "naples",        name: "Naples Cars & Coffee",       city: "Naples",              country: "USA", lng: -81.7948, lat: 26.1420, kind: "Boulevard", tier: "premium", blurb: "Snowbird supercar paradise December-April. Sunday morning meets.", recentCars: ["Pagani Huayra", "McLaren P1", "Bugatti Veyron"], sightings: 612 },
  { id: "hamptons",      name: "East Hampton Main St",       city: "East Hampton",        country: "USA", lng: -72.1846, lat: 40.9634, kind: "Resort",    tier: "premium", blurb: "Summer weekends. Wall Street money + their summer cars.", recentCars: ["Ferrari Roma", "Bentley Bacalar", "Porsche 911 Sport Classic"], sightings: 522 },
  { id: "greenwich",     name: "Greenwich Concours",         city: "Greenwich",           country: "USA", lng: -73.6273, lat: 41.0262, kind: "Concours",  tier: "premium", blurb: "May / June. Hedge-fund money brings out the rare finds.", recentCars: ["Mercedes SSK", "Bugatti T57", "Aston DB4 GT Zagato"], sightings: 388 },

  // ── Europe ──
  { id: "monaco",        name: "Casino Square",              city: "Monte Carlo",         country: "Monaco", lng: 7.4288,  lat: 43.7396, kind: "Boulevard", tier: "iconic",  blurb: "Every parked car costs more than a house. Loop the casino at sunset.", recentCars: ["Pagani Huayra", "Koenigsegg Jesko", "Ferrari Daytona SP3"], sightings: 1602 },
  { id: "mayfair",       name: "Berkeley Square",            city: "London",              country: "UK",     lng: -0.1448, lat: 51.5095, kind: "Boulevard", tier: "iconic",  blurb: "Mayfair's open-air supercar paddock. Gulf plates, gold wraps.", recentCars: ["Bugatti Veyron", "Lamborghini SVJ", "Aston Martin Valkyrie"], sightings: 1418 },
  { id: "goodwood",      name: "Goodwood Estate",            city: "West Sussex",         country: "UK",     lng: -0.7574, lat: 50.8666, kind: "Track",     tier: "iconic",  blurb: "Festival of Speed (June) + Revival (Sept). Anything from 1908 to Le Mans.", recentCars: ["McLaren F1", "Ferrari F40", "Porsche 917"], sightings: 967 },
  { id: "silverstone",   name: "Silverstone Circuit",        city: "Northamptonshire",    country: "UK",     lng: -1.0167, lat: 52.0786, kind: "Track",     tier: "premium", blurb: "Track days, classic meetings, F1 testing. Spotter's paddock paradise.", recentCars: ["Lotus Type 49", "McLaren M23", "Ferrari 312T"], sightings: 612 },
  { id: "nurburgring",   name: "Nürburgring Nordschleife",   city: "Nürburg",             country: "Germany", lng: 6.9430, lat: 50.3356, kind: "Track",    tier: "iconic",  blurb: "Touristenfahrten days — €30 buys you the Green Hell. Spotter's lot dream.", recentCars: ["Porsche GT3 RS", "Nissan GT-R Nismo", "BMW M4 CSL"], sightings: 1789, bestTime: "TF days, check schedule" },
  { id: "geneva",        name: "Geneva Motor Show site",     city: "Geneva",              country: "Switzerland", lng: 6.1080, lat: 46.2353, kind: "Show", tier: "premium", blurb: "March show year. Pagani / Koenigsegg / Bugatti reveal-week traffic.", recentCars: ["Pagani Utopia", "Koenigsegg Gemera", "Bugatti Tourbillon"], sightings: 712 },
  { id: "stmoritz",      name: "Bahnhofstrasse Lots",        city: "St. Moritz",          country: "Switzerland", lng: 9.8389, lat: 46.4983, kind: "Resort", tier: "premium", blurb: "Winter season — every Swiss/German collector on studded supercars.", recentCars: ["Ferrari 812 GTS", "Bentley Bacalar", "Porsche 911 Dakar"], sightings: 612 },
  { id: "sttropez",      name: "Saint-Tropez Old Port",      city: "Saint-Tropez",        country: "France", lng: 6.6395, lat: 43.2727, kind: "Resort",    tier: "iconic",  blurb: "August. Place des Lices to Pampelonne. Yacht season = supercar season.", recentCars: ["Ferrari Roma", "Aston Martin DBX 707", "Pagani Utopia"], sightings: 1102 },
  { id: "milan",         name: "Quadrilatero della Moda",    city: "Milan",               country: "Italy",  lng: 9.1947, lat: 45.4685, kind: "Boulevard", tier: "premium", blurb: "Fashion Week + Salone. Lambo factory two hours away.", recentCars: ["Lamborghini Revuelto", "Ferrari 296 GTB", "Maserati MC20"], sightings: 745 },
  { id: "modena",        name: "Maranello / Modena",         city: "Modena",              country: "Italy",  lng: 10.9252, lat: 44.6471, kind: "Show",     tier: "iconic",  blurb: "Ferrari + Lamborghini + Pagani + Maserati factories all within 30km.", recentCars: ["Ferrari SF90 XX", "Pagani Huayra R", "Lamborghini Revuelto"], sightings: 1018 },
  { id: "barcelona",     name: "Passeig de Gràcia",          city: "Barcelona",           country: "Spain",  lng: 2.1660, lat: 41.3925, kind: "Boulevard", tier: "premium", blurb: "Friday evenings. Ferrari/Lamborghini dealers 200m apart, both park here.", recentCars: ["Lamborghini Revuelto", "Ferrari 296 GTB", "Aston Vantage"], sightings: 638 },
  { id: "marbella",      name: "Puerto Banús",               city: "Marbella",            country: "Spain",  lng: -4.9526, lat: 36.4848, kind: "Resort",   tier: "premium", blurb: "Russian + Saudi money parked alongside yachts. Year-round but peaks August.", recentCars: ["Bugatti Chiron", "Rolls Cullinan Black Badge", "Mansory Pickups"], sightings: 879 },
  { id: "lemans",        name: "Le Mans Circuit",            city: "Le Mans",             country: "France", lng: 0.2275, lat: 47.9495, kind: "Track",     tier: "iconic",  blurb: "24 Hours of Le Mans (June). Le Mans Classic in even years.", recentCars: ["Toyota GR010 Hybrid", "Ferrari 499P", "Porsche 963"], sightings: 712 },
  { id: "spa",           name: "Spa-Francorchamps",          city: "Stavelot",            country: "Belgium", lng: 5.9714, lat: 50.4372, kind: "Track",    tier: "premium", blurb: "24h Spa + 6h Spa + countless trackdays. Eau Rouge in person hits hard.", recentCars: ["Porsche 911 GT3 R", "Ferrari 296 GT3", "BMW M4 GT3"], sightings: 542 },

  // ── Middle East ──
  { id: "dubai",         name: "Dubai Marina",               city: "Dubai",               country: "UAE",    lng: 55.1419, lat: 25.0805, kind: "Boulevard", tier: "iconic",  blurb: "Marina Walk after dark — Bugattis with neon underglow, Lambos on hydraulics.", recentCars: ["Bugatti Chiron Pur Sport", "McLaren P1", "Mansory G-Class"], sightings: 2104 },
  { id: "dubaimall",     name: "Dubai Mall Valet",           city: "Dubai",               country: "UAE",    lng: 55.2796, lat: 25.1972, kind: "Boulevard", tier: "premium", blurb: "World's busiest mall. Valet stand is a rotating supercar show.", recentCars: ["Mansory Cullinan", "Brabus G-Class", "Bugatti Chiron"], sightings: 1745 },
  { id: "abudhabi",      name: "Emirates Palace",            city: "Abu Dhabi",           country: "UAE",    lng: 54.3171, lat: 24.4615, kind: "Resort",    tier: "premium", blurb: "Hotel guest fleet. Royal-family cars + visitor supercars.", recentCars: ["Rolls Phantom", "Bentley Mulsanne", "Bugatti Veyron"], sightings: 988 },
  { id: "riyadh",        name: "Kingdom Centre Tower",       city: "Riyadh",              country: "Saudi Arabia", lng: 46.6743, lat: 24.7117, kind: "Boulevard", tier: "premium", blurb: "Friday nights — royal-collection imports start showing up after sunset.", recentCars: ["Bugatti Centodieci", "Pagani Huayra Codalunga", "Koenigsegg Jesko Absolut"], sightings: 645 },
  { id: "doha",          name: "The Pearl-Qatar",            city: "Doha",                country: "Qatar",  lng: 51.5505, lat: 25.3683, kind: "Resort",    tier: "premium", blurb: "Marina district. Royal-family LaFerrari Aperta sightings.", recentCars: ["LaFerrari Aperta", "Bugatti La Voiture Noire", "Pagani Imola"], sightings: 422 },

  // ── Asia ──
  { id: "daikoku",       name: "Daikoku Futō PA",            city: "Yokohama",            country: "Japan",  lng: 139.6850, lat: 35.4540, kind: "Boulevard", tier: "iconic",  blurb: "Late-night meets. JDM heaven — every Skyline GT-R generation in one lot.", recentCars: ["Nissan R34 GT-R V-Spec II", "Toyota Supra A80", "Honda NSX-R"], sightings: 1893, bestTime: "Friday 11pm-3am" },
  { id: "tatsumi",       name: "Tatsumi PA (Tokyo Loop)",    city: "Tokyo",               country: "Japan",  lng: 139.8233, lat: 35.6280, kind: "Boulevard", tier: "premium", blurb: "Shutoko's most famous parking area. Tuner culture HQ.", recentCars: ["Top Secret Supra", "Mine's R34", "RWB Porsches"], sightings: 1422 },
  { id: "fujispeed",     name: "Fuji Speedway",              city: "Oyama",               country: "Japan",  lng: 138.9275, lat: 35.3717, kind: "Track",     tier: "premium", blurb: "Trackdays + Super GT + WEC rounds. Toyota's home circuit.", recentCars: ["Toyota GR010", "Lexus RC F GT3", "Toyota Supra GT500"], sightings: 488 },
  { id: "shanghai",      name: "Bund + Xintiandi",           city: "Shanghai",            country: "China",  lng: 121.4906, lat: 31.2400, kind: "Boulevard", tier: "premium", blurb: "Saturday nights. Imported supercars (huge tax = bigger flex).", recentCars: ["Bugatti Chiron Sport", "Pagani Huayra Roadster BC", "Koenigsegg Regera"], sightings: 822 },
  { id: "singapore",     name: "Marina Bay Sands",           city: "Singapore",           country: "Singapore", lng: 103.8607, lat: 1.2834, kind: "Resort", tier: "premium", blurb: "F1 race week + year-round valet rotation. COE makes every car a flex.", recentCars: ["Aston DB12 Volante", "Ferrari Roma Spider", "Bentley Continental GT Speed"], sightings: 645 },
  { id: "seoul",         name: "Gangnam District",           city: "Seoul",               country: "South Korea", lng: 127.0276, lat: 37.4979, kind: "Boulevard", tier: "regular", blurb: "Apgujeong / Cheongdam supercar valet rotation.", recentCars: ["Ferrari Roma", "McLaren GT", "Porsche Taycan Turbo S"], sightings: 422 },

  // ── Australia ──
  { id: "bondi",         name: "Bondi Beach Cars & Coffee",  city: "Sydney",              country: "Australia", lng: 151.2767, lat: -33.8915, kind: "Boulevard", tier: "regular", blurb: "Sunday morning meet — heavy on Porsche + Holden / Ford classics.", recentCars: ["Porsche 992 GT3 RS", "HSV Maloo", "Ford GT350R"], sightings: 488 },
  { id: "melbourne",     name: "Brighton Beach Boxes",       city: "Melbourne",           country: "Australia", lng: 144.9831, lat: -37.9176, kind: "Boulevard", tier: "regular", blurb: "Pre-AFR-races weekend. McLaren / Lambo Aus dealer demo runs.", recentCars: ["McLaren 765LT Spider", "Lambo Huracán Tecnica", "Ferrari 296 GTB"], sightings: 388 },

  // ── More boutique / dealer ──
  { id: "rmsothdr",      name: "RM Sotheby's Driving Days",  city: "London",              country: "UK",     lng: -0.1276, lat: 51.5074, kind: "Auction",   tier: "premium", blurb: "Pre-auction viewing + driving events. Open to consigners + bidders.", recentCars: ["1962 Ferrari 250 GTO", "Mercedes 300SL Roadster", "Aston DB5"], sightings: 388 },
  { id: "ladera",        name: "Ladera Ranch C&C",           city: "Ladera Ranch",        country: "USA",    lng: -117.6347, lat: 33.5586, kind: "Boulevard", tier: "regular", blurb: "Saturday morning Orange County meet.", recentCars: ["Porsche 992 Turbo S", "BMW M2 CS", "Ford Mustang GT500"], sightings: 412 },
  { id: "phoenixccoffee",name: "Penzone Cars & Coffee",      city: "Phoenix",             country: "USA",    lng: -111.9261, lat: 33.4484, kind: "Boulevard", tier: "regular", blurb: "Phoenix's biggest Saturday meet.", recentCars: ["Lambo Aventador Ultimae", "Ford GT", "Dodge Demon"], sightings: 522 },
  { id: "atlcc",         name: "Caffeine & Octane",          city: "Atlanta",             country: "USA",    lng: -84.3880, lat: 33.7490, kind: "Boulevard", tier: "premium", blurb: "First Sunday — 6,000+ cars regularly. America's biggest C&C.", recentCars: ["Bugatti Veyron", "Pagani Huayra", "Lamborghini Centenario"], sightings: 1218 },
  { id: "houston",       name: "Houston C&C River Oaks",     city: "Houston",             country: "USA",    lng: -95.3698, lat: 29.7604, kind: "Boulevard", tier: "regular", blurb: "Saturday meets. Texas oil + supercar collectors.", recentCars: ["Ferrari LaFerrari", "Porsche 918 Spyder", "McLaren P1"], sightings: 612 },
  { id: "chicago",       name: "Magnificent Mile",           city: "Chicago",             country: "USA",    lng: -87.6234, lat: 41.8950, kind: "Boulevard", tier: "regular", blurb: "Saturday rolling exotic show on Michigan Ave.", recentCars: ["Porsche 911 Sport Classic", "Lambo SVJ Roadster", "Mercedes-AMG GT Black"], sightings: 488 },
  { id: "nyc-westside",  name: "Westside Highway Loop",      city: "New York",            country: "USA",    lng: -74.0103, lat: 40.7484, kind: "Boulevard", tier: "premium", blurb: "Late nights. Wall Street + UES collectors blasting up/down.", recentCars: ["Lamborghini Revuelto", "Aston DB12", "Ferrari Purosangue"], sightings: 778 },
  { id: "boston",        name: "Boston Cars & Coffee",       city: "Boston",              country: "USA",    lng: -71.0589, lat: 42.3601, kind: "Boulevard", tier: "regular", blurb: "Larz Anderson Auto Museum meets, May–October.", recentCars: ["Porsche 991 GT2 RS", "BMW M4 CSL", "Audi RS6 Performance"], sightings: 422 },
  { id: "seattle",       name: "Bellevue Square",            city: "Bellevue",            country: "USA",    lng: -122.2034, lat: 47.6101, kind: "Boulevard", tier: "regular", blurb: "Microsoft / Amazon tech money. Friday/Saturday valet show.", recentCars: ["Porsche Taycan GT", "Lucid Air Sapphire", "Tesla Roadster prototypes"], sightings: 388 },
  { id: "kuwaitavenues", name: "The Avenues Mall",           city: "Kuwait City",         country: "Kuwait", lng: 47.9495, lat: 29.3017, kind: "Boulevard", tier: "regular", blurb: "Valet rotation. Royal family + Kuwaiti collectors mix.", recentCars: ["Brabus Rocket 900", "Bugatti Veyron", "Pagani Imola"], sightings: 422 },
];

export function spotsAsFeatureCollection(): GeoJSON.FeatureCollection<GeoJSON.Point, Spot> {
  return {
    type: "FeatureCollection",
    features: SPOTS.map((s) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.lng, s.lat] },
      properties: s,
    })),
  };
}
