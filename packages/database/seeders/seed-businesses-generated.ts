/**
 * Business Data Generator
 * =======================
 * Generates realistic outdoor businesses for all 13 anchor cities and inserts
 * them into Supabase. Uses real city coordinates with small offsets for placement.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx packages/database/seeders/seed-businesses-generated.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) { console.error('Missing env vars'); process.exit(1); }

const SB_HEADERS = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates,return=representation',
};

interface City {
  slug: string; name: string; state_province: string; country: string;
  country_code: string; lat: number; lng: number;
}

const CITIES: City[] = [
  { slug: 'moab', name: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', lat: 38.5733, lng: -109.5498 },
  { slug: 'bend', name: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US', lat: 44.0582, lng: -121.3153 },
  { slug: 'boulder', name: 'Boulder', state_province: 'Colorado', country: 'United States', country_code: 'US', lat: 40.0150, lng: -105.2705 },
  { slug: 'sedona', name: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US', lat: 34.8697, lng: -111.7610 },
  { slug: 'tahoe', name: 'Lake Tahoe', state_province: 'California', country: 'United States', country_code: 'US', lat: 39.0968, lng: -120.0324 },
  { slug: 'parkcity', name: 'Park City', state_province: 'Utah', country: 'United States', country_code: 'US', lat: 40.6461, lng: -111.4980 },
  { slug: 'jackson', name: 'Jackson Hole', state_province: 'Wyoming', country: 'United States', country_code: 'US', lat: 43.4799, lng: -110.7624 },
  { slug: 'asheville', name: 'Asheville', state_province: 'North Carolina', country: 'United States', country_code: 'US', lat: 35.5951, lng: -82.5515 },
  { slug: 'chattanooga', name: 'Chattanooga', state_province: 'Tennessee', country: 'United States', country_code: 'US', lat: 35.0456, lng: -85.3097 },
  { slug: 'bellingham', name: 'Bellingham', state_province: 'Washington', country: 'United States', country_code: 'US', lat: 48.7519, lng: -122.4787 },
  { slug: 'whistler', name: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA', lat: 50.1163, lng: -122.9574 },
  { slug: 'queenstown', name: 'Queenstown', state_province: 'Otago', country: 'New Zealand', country_code: 'NZ', lat: -45.0312, lng: 168.6626 },
  { slug: 'chamonix', name: 'Chamonix', state_province: 'Haute-Savoie', country: 'France', country_code: 'FR', lat: 45.9237, lng: 6.8694 },
];

// Templates per category — {CITY} and {ADJ} will be replaced
interface BizTemplate {
  nameTemplate: string;
  category: string;
  activity_types: string[];
  descTemplate: string;
}

const ADJECTIVES = ['Alpine', 'Summit', 'Ridgeline', 'Basecamp', 'Trailhead', 'Vertical', 'Backcountry', 'Pinnacle', 'Canyon', 'Wildside', 'Freeride', 'Outpost', 'Expedition', 'Nomad', 'Switchback'];

const TEMPLATES: BizTemplate[] = [
  { nameTemplate: '{ADJ} Cycles {CITY}', category: 'bike_shop', activity_types: ['mtb', 'road_cycling'], descTemplate: 'Full-service bike shop in {CITY} offering sales, rentals, expert repairs, and local trail beta. Demo fleet updated seasonally.' },
  { nameTemplate: '{CITY} Bike Works', category: 'bike_shop', activity_types: ['mtb', 'road_cycling', 'gravel_biking'], descTemplate: 'Community-driven bike shop specializing in mountain and gravel bikes. Group rides every Saturday morning.' },
  { nameTemplate: '{ADJ} Outdoor Co.', category: 'outdoor_gear_shop', activity_types: ['hiking', 'camping', 'climbing'], descTemplate: 'Premium outdoor gear for {CITY} adventures. Curated selection of packs, tents, climbing gear, and apparel from top brands.' },
  { nameTemplate: '{CITY} Gear Exchange', category: 'outdoor_gear_shop', activity_types: ['hiking', 'camping', 'trail_running'], descTemplate: 'New and consignment outdoor gear at great prices. Trade in your old kit and upgrade for the season.' },
  { nameTemplate: '{ADJ} Climbing Guides', category: 'guide_service', activity_types: ['climbing', 'mountaineering'], descTemplate: 'AMGA-certified guides offering courses and guided climbs near {CITY}. From first-timers to multi-pitch leads.' },
  { nameTemplate: '{CITY} Adventure Co.', category: 'guide_service', activity_types: ['hiking', 'climbing', 'kayaking'], descTemplate: 'Multi-sport guided adventures in the {CITY} area. Half-day to multi-day trips tailored to your skill level.' },
  { nameTemplate: '{ADJ} SUP & Kayak', category: 'kayak_sup', activity_types: ['kayaking', 'standup_paddle'], descTemplate: 'Kayak and paddleboard rentals with guided tours near {CITY}. Sunset paddles and full-moon specials available.' },
  { nameTemplate: '{CITY} River Sports', category: 'kayak_sup', activity_types: ['kayaking', 'rafting'], descTemplate: 'Whitewater rafting, kayaking, and tubing outfitter serving the {CITY} corridor. All skill levels welcome.' },
  { nameTemplate: '{ADJ} Campground', category: 'camping', activity_types: ['camping', 'hiking'], descTemplate: 'Scenic campground near {CITY} with tent sites, RV hookups, hot showers, and direct trail access.' },
  { nameTemplate: '{CITY} Basecamp Hostel', category: 'adventure_hostel', activity_types: ['hiking', 'mtb', 'climbing'], descTemplate: 'Affordable adventure accommodation in {CITY}. Gear storage, communal kitchen, and nightly trail talks.' },
  { nameTemplate: '{ADJ} Coffee Roasters', category: 'trailhead_cafe', activity_types: ['hiking', 'mtb', 'trail_running'], descTemplate: 'Specialty coffee and hearty breakfast burritos — the go-to fuel stop before hitting {CITY} trails.' },
  { nameTemplate: 'Dirt Church Café', category: 'trailhead_cafe', activity_types: ['mtb', 'hiking'], descTemplate: 'Post-ride hangout with craft beer, wood-fired pizza, and a bike wash station. Right off the main trail network in {CITY}.' },
  { nameTemplate: '{CITY} Ski & Board', category: 'outdoor_gear_shop', activity_types: ['skiing', 'snowboarding'], descTemplate: 'Expert boot fitting, tune shop, and seasonal rentals for {CITY} ski season. Demo days every weekend in winter.' },
  { nameTemplate: '{ADJ} Trail Running Co.', category: 'outdoor_gear_shop', activity_types: ['trail_running', 'hiking'], descTemplate: 'Specialty trail running shop with gait analysis, shoe fitting, and weekly group runs around {CITY}.' },
  { nameTemplate: '{CITY} Fly Shop', category: 'outfitter', activity_types: ['fishing'], descTemplate: 'Guided fly fishing, gear, and local stream reports for the {CITY} area. Half and full-day wading trips.' },
];

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

// Deterministic pseudo-random from seed
function seededRand(seed: number) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

function generateBusinesses(city: City): any[] {
  const businesses: any[] = [];
  const seed = city.lat * 1000 + city.lng;

  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i];
    const adj = ADJECTIVES[(Math.abs(Math.floor(seed * (i + 1))) % ADJECTIVES.length)];
    const name = t.nameTemplate.replace('{CITY}', city.name).replace('{ADJ}', adj);
    const desc = t.descTemplate.replace(/\{CITY\}/g, city.name);
    const r1 = seededRand(seed + i * 7);
    const r2 = seededRand(seed + i * 13);
    const latOffset = (r1 - 0.5) * 0.04; // ~2km spread
    const lngOffset = (r2 - 0.5) * 0.04;

    businesses.push({
      name,
      slug: slugify(name),
      description: desc,
      category: t.category,
      activity_types: t.activity_types,
      city: city.name,
      state_province: city.state_province,
      country: city.country,
      country_code: city.country_code,
      hours: {},
      photos: [],
      is_claimed: false,
      is_active: true,
      rating: parseFloat((3.5 + r1 * 1.5).toFixed(1)),
      review_count: Math.floor(20 + r2 * 280),
    });
  }
  return businesses;
}

async function main() {
  console.log('=== CairnConnect Business Generator ===\n');
  let total = 0;

  for (const city of CITIES) {
    const businesses = generateBusinesses(city);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/businesses?on_conflict=slug`, {
      method: 'POST', headers: SB_HEADERS, body: JSON.stringify(businesses),
    });
    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : businesses.length;
      console.log(`  ${city.name}: ${count} businesses upserted`);
      total += count;
    } else {
      const err = await res.text();
      console.error(`  ${city.name}: ERROR — ${err.substring(0, 150)}`);
    }
  }
  console.log(`\n=== Done: ${total} total businesses ===`);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });

