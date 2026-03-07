/**
 * OSM Business Seeder
 * ===================
 * Queries Overpass API for outdoor-related businesses (bike shops, gear stores,
 * guide services, cafes, hostels, kayak rentals, etc.) around each anchor city.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx packages/database/seeders/seed-businesses-osm.ts
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

const OVERPASS_URL = 'https://overpass.kumi.systems/api/interpreter';
const DELAY_MS = 8_000;
const MAX_RETRIES = 3;
const BATCH_SIZE = 50;

interface City {
  slug: string; name: string; state_province: string; country: string;
  country_code: string; lat: number; lng: number; radius_km: number;
}

const ANCHOR_CITIES: City[] = [
  { slug: 'moab_ut', name: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', lat: 38.5733, lng: -109.5498, radius_km: 60 },
  { slug: 'bend_or', name: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US', lat: 44.0582, lng: -121.3153, radius_km: 50 },
  { slug: 'boulder_co', name: 'Boulder', state_province: 'Colorado', country: 'United States', country_code: 'US', lat: 40.0150, lng: -105.2705, radius_km: 50 },
  { slug: 'sedona_az', name: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US', lat: 34.8697, lng: -111.7610, radius_km: 40 },
  { slug: 'lake_tahoe_ca', name: 'Lake Tahoe', state_province: 'California', country: 'United States', country_code: 'US', lat: 39.0968, lng: -120.0324, radius_km: 50 },
  { slug: 'park_city_ut', name: 'Park City', state_province: 'Utah', country: 'United States', country_code: 'US', lat: 40.6461, lng: -111.4980, radius_km: 40 },
  { slug: 'jackson_wy', name: 'Jackson Hole', state_province: 'Wyoming', country: 'United States', country_code: 'US', lat: 43.4799, lng: -110.7624, radius_km: 50 },
  { slug: 'asheville_nc', name: 'Asheville', state_province: 'North Carolina', country: 'United States', country_code: 'US', lat: 35.5951, lng: -82.5515, radius_km: 50 },
  { slug: 'chattanooga_tn', name: 'Chattanooga', state_province: 'Tennessee', country: 'United States', country_code: 'US', lat: 35.0456, lng: -85.3097, radius_km: 50 },
  { slug: 'bellingham_wa', name: 'Bellingham', state_province: 'Washington', country: 'United States', country_code: 'US', lat: 48.7519, lng: -122.4787, radius_km: 50 },
  { slug: 'whistler_bc', name: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA', lat: 50.1163, lng: -122.9574, radius_km: 40 },
  { slug: 'queenstown_nz', name: 'Queenstown', state_province: 'Otago', country: 'New Zealand', country_code: 'NZ', lat: -45.0312, lng: 168.6626, radius_km: 50 },
  { slug: 'chamonix_fr', name: 'Chamonix', state_province: 'Haute-Savoie', country: 'France', country_code: 'FR', lat: 45.9237, lng: 6.8694, radius_km: 30 },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function queryOverpass(q: string, retries = 0): Promise<any> {
  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(q)}`,
    });
    if (res.status === 429 || res.status >= 500) {
      if (retries < MAX_RETRIES) {
        const wait = DELAY_MS * Math.pow(2, retries);
        console.warn(`  Overpass ${res.status}, retrying in ${wait}ms...`);
        await sleep(wait);
        return queryOverpass(q, retries + 1);
      }
      throw new Error(`Overpass ${res.status} after retries`);
    }
    const text = await res.text();
    if (text.startsWith('<?xml') || text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      console.warn(`  Overpass returned HTML (rate limit), retrying in ${DELAY_MS * 2}ms...`);
      if (retries < MAX_RETRIES) {
        await sleep(DELAY_MS * 2);
        return queryOverpass(q, retries + 1);
      }
      return { elements: [] };
    }
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseErr) {
      console.error(`  Failed to parse (len=${text.length}): ${text.substring(0, 200)}`);
      return { elements: [] };
    }
  } catch (e: any) {
    if (retries < MAX_RETRIES) {
      await sleep(DELAY_MS * Math.pow(2, retries));
      return queryOverpass(q, retries + 1);
    }
    throw e;
  }
}

/** Split queries into smaller batches to avoid Overpass timeouts */
function buildQueries(city: City): string[] {
  const r = city.radius_km * 1000;
  const c = `${city.lat},${city.lng}`;
  // Batch 1: Shops
  const q1 = `[out:json][timeout:60];(node["shop"="bicycle"](around:${r},${c});node["shop"="outdoor"](around:${r},${c});node["shop"="sports"](around:${r},${c});way["shop"="bicycle"](around:${r},${c});way["shop"="outdoor"](around:${r},${c}););out center tags;`;
  // Batch 2: Tourism + accommodation
  const q2 = `[out:json][timeout:60];(node["tourism"="alpine_hut"](around:${r},${c});node["tourism"="wilderness_hut"](around:${r},${c});node["tourism"="camp_site"]["name"](around:${r},${c});node["tourism"="hostel"]["name"](around:${r},${c});way["tourism"="camp_site"]["name"](around:${r},${c}););out center tags;`;
  // Batch 3: Sports + cafes
  const q3 = `[out:json][timeout:60];(node["sport"="climbing"]["name"](around:${r},${c});node["sport"="kayak"]["name"](around:${r},${c});node["sport"="canoe"]["name"](around:${r},${c});node["sport"="surfing"]["name"](around:${r},${c});node["amenity"="cafe"]["name"](around:${r},${c}););out center tags;`;
  return [q1, q2, q3];
}


// Map OSM tags to CairnConnect business categories
function mapCategory(tags: Record<string, string>): { category: string; activity_types: string[] } {
  const shop = tags.shop ?? '';
  const tourism = tags.tourism ?? '';
  const sport = tags.sport ?? '';
  const amenity = tags.amenity ?? '';

  if (shop === 'bicycle') return { category: 'bike_shop', activity_types: ['mtb', 'road_cycling'] };
  if (shop === 'outdoor') return { category: 'outdoor_gear_shop', activity_types: ['hiking', 'camping', 'climbing'] };
  if (shop === 'sports') return { category: 'outdoor_gear_shop', activity_types: ['hiking', 'trail_running'] };
  if (tourism === 'alpine_hut' || tourism === 'wilderness_hut') return { category: 'mountain_hut', activity_types: ['hiking', 'skiing'] };
  if (tourism === 'camp_site') return { category: 'camping', activity_types: ['camping', 'hiking'] };
  if (tourism === 'hostel') return { category: 'adventure_hostel', activity_types: ['hiking', 'mtb'] };
  if (sport === 'climbing') return { category: 'guide_service', activity_types: ['climbing'] };
  if (sport === 'kayak' || sport === 'canoe') return { category: 'kayak_sup', activity_types: ['kayaking', 'standup_paddle'] };
  if (sport === 'surfing') return { category: 'surf_school', activity_types: ['surfing'] };
  if (sport === 'skiing') return { category: 'outdoor_gear_shop', activity_types: ['skiing', 'snowboarding'] };
  if (amenity === 'cafe') return { category: 'trailhead_cafe', activity_types: ['hiking', 'mtb'] };
  return { category: 'outfitter', activity_types: ['hiking'] };
}

function generateSlug(name: string, osmId: number): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + `-osm-${osmId}`;
}

function elementToBusiness(el: any, city: City): any | null {
  const tags = el.tags ?? {};
  const name = tags.name ?? tags['name:en'] ?? null;
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;
  if (!lat || !lon) return null;

  const { category, activity_types } = mapCategory(tags);

  return {
    name,
    slug: generateSlug(name, el.id),
    description: tags.description ?? tags.note ?? null,
    category,
    activity_types,
    address: [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || null,
    city: city.name,
    state_province: city.state_province,
    country: city.country,
    country_code: city.country_code,
    postal_code: tags['addr:postcode'] ?? null,
    phone: tags.phone ?? tags['contact:phone'] ?? null,
    website_url: tags.website ?? tags['contact:website'] ?? null,
    email: tags.email ?? tags['contact:email'] ?? null,
    hours: tags.opening_hours ? { raw: tags.opening_hours } : {},
    photos: [],
    is_claimed: false,
    is_active: true,
    rating: null,
    review_count: 0,
  };
}

async function upsertBatch(businesses: any[]): Promise<{ ok: number; err: number }> {
  let ok = 0, err = 0;
  for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
    const batch = businesses.slice(i, i + BATCH_SIZE);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/businesses?on_conflict=slug`, {
      method: 'POST', headers: SB_HEADERS, body: JSON.stringify(batch),
    });
    if (res.ok) {
      const data = await res.json();
      ok += Array.isArray(data) ? data.length : batch.length;
    } else {
      const errText = await res.text();
      console.error(`  Batch error (${res.status}): ${errText.substring(0, 150)}`);
      // Fall back to individual
      for (const biz of batch) {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/businesses?on_conflict=slug`, {
          method: 'POST',
          headers: { ...SB_HEADERS, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(biz),
        });
        if (r.ok) { ok++; } else {
          const e = await r.text();
          if (err < 3) console.error(`    Individual error: ${e.substring(0, 120)}`);
          err++;
        }
      }
    }
  }
  return { ok, err };
}

async function main() {
  console.log('=== CairnConnect OSM Business Seeder ===\n');

  let totalOk = 0, totalErr = 0;

  for (let i = 0; i < ANCHOR_CITIES.length; i++) {
    const city = ANCHOR_CITIES[i];
    console.log(`\n--- ${city.name}, ${city.state_province} (${city.country_code}) ---`);

    const queries = buildQueries(city);
    let elements: any[] = [];
    for (let qi = 0; qi < queries.length; qi++) {
      const resp = await queryOverpass(queries[qi]);
      const batch = resp.elements ?? [];
      console.log(`  Batch ${qi + 1}/${queries.length}: ${batch.length} elements`);
      elements = elements.concat(batch);
      if (qi < queries.length - 1) await sleep(3000);
    }
    console.log(`  Total: ${elements.length} OSM elements`);

    const seen = new Set<string>();
    const businesses: any[] = [];
    for (const el of elements) {
      const biz = elementToBusiness(el, city);
      if (!biz || seen.has(biz.external_id)) continue;
      seen.add(biz.external_id);
      businesses.push(biz);
    }

    console.log(`  Mapped ${businesses.length} named businesses`);
    if (businesses.length === 0) continue;

    const { ok, err } = await upsertBatch(businesses);
    console.log(`  Upserted: ${ok} | Errors: ${err}`);
    totalOk += ok; totalErr += err;

    if (i < ANCHOR_CITIES.length - 1) {
      console.log(`  Waiting ${DELAY_MS}ms...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n=== Done: ${totalOk} businesses inserted, ${totalErr} errors ===`);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
