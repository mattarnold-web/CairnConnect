/**
 * CairnConnect Database Seed Script
 *
 * Populates the Supabase/PostGIS database with realistic outdoor activity data
 * across five regions: Moab UT, Bend OR, Whistler BC, Sedona AZ, Lake Tahoe CA/NV.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... npx tsx scripts/seed-database.ts
 *
 * Requires: @supabase/supabase-js (installed in the monorepo)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Missing environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const daysFromNow = (d: number): string =>
  new Date(Date.now() + d * 86_400_000).toISOString();

const daysAgo = (d: number): string =>
  new Date(Date.now() - d * 86_400_000).toISOString();

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Execute raw SQL via Supabase's rpc or REST. Falls back to the sql endpoint. */
async function execSql(sql: string): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', { query: sql }).single();
  if (error) {
    // If the RPC doesn't exist, try direct REST
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!res.ok) {
      console.warn('exec_sql RPC not available. Some PostGIS operations may fail.');
    }
  }
}

// ---------------------------------------------------------------------------
// Seed Users (needed as FK targets for reviews / activity posts)
// ---------------------------------------------------------------------------

const SEED_USERS = [
  { id: '00000000-0000-0000-0000-000000000001', email: 'tyler@example.com', display_name: 'Tyler R.', username: 'tyler_rides' },
  { id: '00000000-0000-0000-0000-000000000002', email: 'meera@example.com', display_name: 'Meera P.', username: 'meera_trails' },
  { id: '00000000-0000-0000-0000-000000000003', email: 'colin@example.com', display_name: 'Colin W.', username: 'colin_west' },
  { id: '00000000-0000-0000-0000-000000000004', email: 'sarah@example.com', display_name: 'Sarah K.', username: 'sarah_climbs' },
  { id: '00000000-0000-0000-0000-000000000005', email: 'dan@example.com', display_name: 'Dan W.', username: 'dan_mtb' },
  { id: '00000000-0000-0000-0000-000000000006', email: 'ava@example.com', display_name: 'Ava T.', username: 'ava_hikes' },
  { id: '00000000-0000-0000-0000-000000000007', email: 'jake@example.com', display_name: 'Jake H.', username: 'jake_shreds' },
  { id: '00000000-0000-0000-0000-000000000008', email: 'rosa@example.com', display_name: 'Rosa M.', username: 'rosa_runs' },
  { id: '00000000-0000-0000-0000-000000000009', email: 'ben@example.com', display_name: 'Ben L.', username: 'ben_paddles' },
  { id: '00000000-0000-0000-0000-000000000010', email: 'casey@example.com', display_name: 'Casey J.', username: 'casey_skis' },
];

// ---------------------------------------------------------------------------
// Permits
// ---------------------------------------------------------------------------

interface SeedPermit {
  name: string;
  type: string;
  fee: number;
  requires_reservation: boolean;
  reservation_url: string | null;
  info_url: string | null;
  lat: number;
  lng: number;
  country: string;
  country_code: string;
  state_province: string;
  region: string;
  season_start: string | null;
  season_end: string | null;
}

const SEED_PERMITS: SeedPermit[] = [
  { name: 'Dead Horse Point State Park Day Use', type: 'day_use', fee: 15, requires_reservation: false, reservation_url: null, info_url: 'https://stateparks.utah.gov/parks/dead-horse/', lat: 38.4829, lng: -109.7317, country: 'United States', country_code: 'US', state_province: 'Utah', region: 'Moab', season_start: null, season_end: null },
  { name: 'Sand Flats Recreation Area Day Use', type: 'day_use', fee: 5, requires_reservation: false, reservation_url: null, info_url: 'https://www.grandcountyutah.net/352/Sand-Flats', lat: 38.5912, lng: -109.5128, country: 'United States', country_code: 'US', state_province: 'Utah', region: 'Moab', season_start: null, season_end: null },
  { name: 'Deschutes National Forest Trail Park Pass', type: 'day_use', fee: 5, requires_reservation: false, reservation_url: null, info_url: 'https://www.fs.usda.gov/deschutes', lat: 44.0582, lng: -121.3153, country: 'United States', country_code: 'US', state_province: 'Oregon', region: 'Bend', season_start: null, season_end: null },
  { name: 'Red Rock Pass (Coconino NF)', type: 'day_use', fee: 5, requires_reservation: false, reservation_url: null, info_url: 'https://www.fs.usda.gov/coconino', lat: 34.8697, lng: -111.7610, country: 'United States', country_code: 'US', state_province: 'Arizona', region: 'Sedona', season_start: null, season_end: null },
  { name: 'Desolation Wilderness Day Permit', type: 'day_use', fee: 0, requires_reservation: true, reservation_url: 'https://www.recreation.gov/permits/233261', info_url: 'https://www.fs.usda.gov/eldorado', lat: 38.9500, lng: -120.1500, country: 'United States', country_code: 'US', state_province: 'California', region: 'Lake Tahoe', season_start: 'June', season_end: 'October' },
];

// ---------------------------------------------------------------------------
// Trails
// ---------------------------------------------------------------------------

interface SeedTrail {
  name: string;
  description: string;
  activity_types: string[];
  difficulty: string;
  difficulty_label: string;
  technical_rating: number;
  distance_meters: number;
  elevation_gain_meters: number;
  elevation_loss_meters: number;
  max_elevation_meters: number;
  min_elevation_meters: number;
  trail_type: string;
  surface_type: string[];
  lat: number;
  lng: number;
  city: string;
  state_province: string;
  country: string;
  country_code: string;
  current_condition: string;
  requires_permit: boolean;
  permit_name: string | null;
  rating: number;
  review_count: number;
  ride_count: number;
  best_seasons: string[];
}

const SEED_TRAILS: SeedTrail[] = [
  // ===== MOAB, UTAH =====
  {
    name: 'Slickrock Trail', description: 'The trail that put Moab on the mountain biking map. 10.5 miles of petrified sand dunes with traction you have to feel to believe. Painted white dashes mark the route across undulating Navajo Sandstone. Incredibly exposed -- bring sun protection and at least 3 liters of water.',
    activity_types: ['mtb', 'hiking'], difficulty: 'black', difficulty_label: 'Advanced', technical_rating: 4,
    distance_meters: 16900, elevation_gain_meters: 396, elevation_loss_meters: 396, max_elevation_meters: 1524, min_elevation_meters: 1402,
    trail_type: 'loop', surface_type: ['sandstone', 'slickrock'], lat: 38.5912, lng: -109.5128,
    city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Sand Flats Recreation Area Day Use',
    rating: 4.8, review_count: 1243, ride_count: 18742, best_seasons: ['spring', 'fall'],
  },
  {
    name: 'Porcupine Rim', description: 'One of the premier point-to-point descents in the world. 14 miles of singletrack starting above the La Sal Mountains with massive exposure along the Colorado River canyon rim. The final descent into the valley is steep and legendary.',
    activity_types: ['mtb'], difficulty: 'double_black', difficulty_label: 'Expert', technical_rating: 5,
    distance_meters: 22530, elevation_gain_meters: 244, elevation_loss_meters: 914, max_elevation_meters: 1920, min_elevation_meters: 1219,
    trail_type: 'point_to_point', surface_type: ['singletrack', 'rock', 'sand'], lat: 38.5955, lng: -109.4432,
    city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.9, review_count: 876, ride_count: 11234, best_seasons: ['spring', 'fall'],
  },
  {
    name: 'Poison Spider Mesa', description: 'Technical out-and-back across a high mesa with sweeping views of the Colorado River, Behind the Rocks, and the La Sal Mountains. The optional Portal Trail descent is a no-fall-zone cliff edge.',
    activity_types: ['mtb', 'hiking'], difficulty: 'double_black', difficulty_label: 'Expert', technical_rating: 5,
    distance_meters: 14480, elevation_gain_meters: 488, elevation_loss_meters: 488, max_elevation_meters: 1585, min_elevation_meters: 1219,
    trail_type: 'out_and_back', surface_type: ['slickrock', 'rock', 'sand'], lat: 38.5622, lng: -109.5887,
    city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.7, review_count: 532, ride_count: 7891, best_seasons: ['spring', 'fall'],
  },
  {
    name: 'Corona Arch Trail', description: 'Short but spectacular hiking trail to one of the largest free-standing arches in Utah. The route crosses railroad tracks, traverses slickrock, and includes a scramble section with fixed cables and a short ladder.',
    activity_types: ['hiking', 'trail_running'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 2,
    distance_meters: 4828, elevation_gain_meters: 137, elevation_loss_meters: 137, max_elevation_meters: 1341, min_elevation_meters: 1244,
    trail_type: 'out_and_back', surface_type: ['slickrock', 'rock', 'dirt'], lat: 38.5808, lng: -109.6204,
    city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.7, review_count: 1567, ride_count: 0, best_seasons: ['spring', 'fall', 'winter'],
  },
  {
    name: 'Fisher Towers Trail', description: 'A surreal hike through towering Cutler sandstone formations that look like drip castles from another planet. The trail weaves between the towers with views of the Colorado River valley and the La Sal range.',
    activity_types: ['hiking', 'trail_running'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 2,
    distance_meters: 7080, elevation_gain_meters: 224, elevation_loss_meters: 224, max_elevation_meters: 1524, min_elevation_meters: 1372,
    trail_type: 'out_and_back', surface_type: ['dirt', 'rock', 'sand'], lat: 38.7265, lng: -109.3079,
    city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.6, review_count: 987, ride_count: 0, best_seasons: ['spring', 'fall'],
  },
  {
    name: 'Amasa Back', description: 'Challenging mesa-top ride with the optional Cliffhanger add-on that delivers some of the most technical and exposed riding in Moab. The climb is relentless but the views of Hurrah Pass and the Colorado River are staggering.',
    activity_types: ['mtb'], difficulty: 'black', difficulty_label: 'Advanced', technical_rating: 4,
    distance_meters: 15610, elevation_gain_meters: 457, elevation_loss_meters: 457, max_elevation_meters: 1524, min_elevation_meters: 1219,
    trail_type: 'out_and_back', surface_type: ['slickrock', 'rock', 'singletrack'], lat: 38.5532, lng: -109.5865,
    city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US',
    current_condition: 'caution', requires_permit: false, permit_name: null,
    rating: 4.8, review_count: 612, ride_count: 8923, best_seasons: ['spring', 'fall'],
  },
  {
    name: 'Gemini Bridges', description: 'A long, mostly downhill ride from the top access that passes two massive natural rock bridges spanning a deep canyon. Excellent intermediate ride and one of the best shuttle-assisted trails in the area.',
    activity_types: ['mtb', 'hiking'], difficulty: 'green', difficulty_label: 'Beginner', technical_rating: 2,
    distance_meters: 22530, elevation_gain_meters: 152, elevation_loss_meters: 610, max_elevation_meters: 1646, min_elevation_meters: 1219,
    trail_type: 'point_to_point', surface_type: ['doubletrack', 'dirt', 'singletrack'], lat: 38.6318, lng: -109.6241,
    city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.3, review_count: 567, ride_count: 9876, best_seasons: ['spring', 'fall', 'winter'],
  },
  {
    name: 'Dead Horse Point Rim Trail', description: 'A stunning loop along the edge of Dead Horse Point State Park with jaw-dropping overlooks of the Colorado River gooseneck 2,000 feet below. Mostly smooth singletrack with a few rocky sections.',
    activity_types: ['mtb', 'hiking', 'trail_running'], difficulty: 'green', difficulty_label: 'Beginner', technical_rating: 2,
    distance_meters: 14160, elevation_gain_meters: 91, elevation_loss_meters: 91, max_elevation_meters: 1829, min_elevation_meters: 1768,
    trail_type: 'loop', surface_type: ['singletrack', 'dirt', 'rock'], lat: 38.4829, lng: -109.7317,
    city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Dead Horse Point State Park Day Use',
    rating: 4.7, review_count: 1102, ride_count: 12345, best_seasons: ['spring', 'fall', 'winter'],
  },

  // ===== BEND, OREGON =====
  {
    name: 'Phil\'s Trail Complex', description: 'The heart of Bend\'s legendary trail system. Miles of flowy, bermed singletrack through ponderosa pine forest. Multiple loops let you dial in the perfect ride length from a quick after-work loop to an all-day epic.',
    activity_types: ['mtb', 'trail_running'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 3,
    distance_meters: 14500, elevation_gain_meters: 305, elevation_loss_meters: 305, max_elevation_meters: 1372, min_elevation_meters: 1280,
    trail_type: 'network', surface_type: ['singletrack', 'pumice', 'dirt'], lat: 44.0342, lng: -121.3548,
    city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Deschutes National Forest Trail Park Pass',
    rating: 4.7, review_count: 1834, ride_count: 24500, best_seasons: ['spring', 'summer', 'fall'],
  },
  {
    name: 'Tiddlywinks', description: 'One of Bend\'s most popular intermediate trails with smooth, flowing singletrack through open pine forest. Gentle climbs and fun descents make it perfect for building skills or a relaxed ride.',
    activity_types: ['mtb'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 2,
    distance_meters: 8400, elevation_gain_meters: 183, elevation_loss_meters: 183, max_elevation_meters: 1340, min_elevation_meters: 1280,
    trail_type: 'loop', surface_type: ['singletrack', 'pumice'], lat: 44.0280, lng: -121.3610,
    city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Deschutes National Forest Trail Park Pass',
    rating: 4.5, review_count: 892, ride_count: 15600, best_seasons: ['spring', 'summer', 'fall'],
  },
  {
    name: 'South Sister Summit', description: 'The highest point in Bend\'s backyard at 10,358 feet. A non-technical but demanding hike up volcanic scree to panoramic views of the entire Cascade Range. Snowfields persist through July on the upper slopes.',
    activity_types: ['hiking'], difficulty: 'black', difficulty_label: 'Advanced', technical_rating: 3,
    distance_meters: 18500, elevation_gain_meters: 1494, elevation_loss_meters: 1494, max_elevation_meters: 3157, min_elevation_meters: 1663,
    trail_type: 'out_and_back', surface_type: ['volcanic rock', 'scree', 'snow'], lat: 44.1033, lng: -121.7692,
    city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.8, review_count: 2145, ride_count: 0, best_seasons: ['summer', 'fall'],
  },
  {
    name: 'Deschutes River Trail', description: 'A scenic out-and-back along the Deschutes River through old-growth ponderosa. Popular with runners and hikers alike, with several river access points for a cool dip on hot summer days.',
    activity_types: ['hiking', 'trail_running'], difficulty: 'green', difficulty_label: 'Beginner', technical_rating: 1,
    distance_meters: 17700, elevation_gain_meters: 120, elevation_loss_meters: 120, max_elevation_meters: 1130, min_elevation_meters: 1100,
    trail_type: 'out_and_back', surface_type: ['dirt', 'gravel', 'boardwalk'], lat: 44.0491, lng: -121.3335,
    city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.4, review_count: 1456, ride_count: 0, best_seasons: ['spring', 'summer', 'fall'],
  },
  {
    name: 'Tumalo Falls Trail', description: 'A popular hike starting at the impressive 97-foot Tumalo Falls waterfall. The trail continues upstream past a series of smaller cascades through lush forest. Can be combined with other trails for a longer loop.',
    activity_types: ['hiking', 'trail_running'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 2,
    distance_meters: 10900, elevation_gain_meters: 366, elevation_loss_meters: 366, max_elevation_meters: 1860, min_elevation_meters: 1616,
    trail_type: 'out_and_back', surface_type: ['dirt', 'rock', 'roots'], lat: 44.0323, lng: -121.5676,
    city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Deschutes National Forest Trail Park Pass',
    rating: 4.6, review_count: 1890, ride_count: 0, best_seasons: ['summer', 'fall'],
  },
  {
    name: 'Whoops Trail', description: 'Fast, flowy, and full of natural features. Whoops is a Bend MTB classic with bermed corners, small drops, and rollers that reward speed. Connects into the larger Phil\'s-area network for all-day linking.',
    activity_types: ['mtb'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 3,
    distance_meters: 5200, elevation_gain_meters: 110, elevation_loss_meters: 150, max_elevation_meters: 1350, min_elevation_meters: 1280,
    trail_type: 'point_to_point', surface_type: ['singletrack', 'pumice', 'dirt'], lat: 44.0315, lng: -121.3580,
    city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Deschutes National Forest Trail Park Pass',
    rating: 4.6, review_count: 743, ride_count: 11200, best_seasons: ['spring', 'summer', 'fall'],
  },

  // ===== WHISTLER, BC =====
  {
    name: 'A-Line', description: 'The most iconic jump trail in the world. Perfectly sculpted tabletops and berms descend through the Whistler Mountain Bike Park. A rite of passage for every mountain biker who visits Whistler.',
    activity_types: ['mtb'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 3,
    distance_meters: 3200, elevation_gain_meters: 0, elevation_loss_meters: 430, max_elevation_meters: 1290, min_elevation_meters: 860,
    trail_type: 'point_to_point', surface_type: ['dirt', 'machine-built'], lat: 50.0866, lng: -122.9570,
    city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA',
    current_condition: 'closed', requires_permit: false, permit_name: null,
    rating: 4.9, review_count: 3456, ride_count: 89000, best_seasons: ['summer'],
  },
  {
    name: 'Dirt Merchant', description: 'Smooth, flowy jump trail with a mix of tables and step-ups. Slightly mellower than A-Line but still packs plenty of airtime. Great for progressing jumping skills in the bike park.',
    activity_types: ['mtb'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 3,
    distance_meters: 2100, elevation_gain_meters: 0, elevation_loss_meters: 310, max_elevation_meters: 1170, min_elevation_meters: 860,
    trail_type: 'point_to_point', surface_type: ['dirt', 'machine-built'], lat: 50.0870, lng: -122.9540,
    city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA',
    current_condition: 'closed', requires_permit: false, permit_name: null,
    rating: 4.7, review_count: 1234, ride_count: 45000, best_seasons: ['summer'],
  },
  {
    name: 'Comfortably Numb', description: 'A legendary cross-country epic in the Whistler valley. Smooth singletrack winds through ancient cedar forests with creek crossings and mountain views. The climb is sustained but the trail quality is world-class throughout.',
    activity_types: ['mtb', 'trail_running'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 3,
    distance_meters: 21000, elevation_gain_meters: 640, elevation_loss_meters: 820, max_elevation_meters: 1050, min_elevation_meters: 640,
    trail_type: 'point_to_point', surface_type: ['singletrack', 'roots', 'rock'], lat: 50.1442, lng: -122.9237,
    city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.8, review_count: 2100, ride_count: 32000, best_seasons: ['summer', 'fall'],
  },
  {
    name: 'High Note Trail', description: 'An alpine hiking trail with panoramic views of Cheakamus Lake, Black Tusk, and the volcanic peaks of Garibaldi Park. Accessed from the top of the Peak Express chair on Whistler Mountain.',
    activity_types: ['hiking'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 2,
    distance_meters: 9500, elevation_gain_meters: 200, elevation_loss_meters: 500, max_elevation_meters: 1850, min_elevation_meters: 1350,
    trail_type: 'point_to_point', surface_type: ['alpine', 'rock', 'dirt'], lat: 50.0621, lng: -122.9480,
    city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA',
    current_condition: 'closed', requires_permit: false, permit_name: null,
    rating: 4.7, review_count: 1678, ride_count: 0, best_seasons: ['summer'],
  },
  {
    name: 'Top of the World', description: 'Whistler Bike Park\'s crown jewel. A long, technical descent from the peak of Whistler Mountain through alpine meadows, rocky chutes, and old-growth forest. The views alone are worth the lift ticket.',
    activity_types: ['mtb'], difficulty: 'black', difficulty_label: 'Advanced', technical_rating: 4,
    distance_meters: 7800, elevation_gain_meters: 0, elevation_loss_meters: 1100, max_elevation_meters: 2182, min_elevation_meters: 1082,
    trail_type: 'point_to_point', surface_type: ['rock', 'alpine', 'singletrack'], lat: 50.0600, lng: -122.9500,
    city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA',
    current_condition: 'closed', requires_permit: false, permit_name: null,
    rating: 4.9, review_count: 2890, ride_count: 28000, best_seasons: ['summer'],
  },
  {
    name: 'Whistler Train Wreck', description: 'A unique short hike to a collection of abandoned boxcars in the forest, covered in colorful graffiti. Crosses a suspension bridge over the Cheakamus River. A local favorite for a quick outing.',
    activity_types: ['hiking'], difficulty: 'green', difficulty_label: 'Beginner', technical_rating: 1,
    distance_meters: 4000, elevation_gain_meters: 60, elevation_loss_meters: 60, max_elevation_meters: 620, min_elevation_meters: 580,
    trail_type: 'out_and_back', surface_type: ['gravel', 'boardwalk', 'dirt'], lat: 50.1050, lng: -122.9680,
    city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.3, review_count: 2345, ride_count: 0, best_seasons: ['spring', 'summer', 'fall'],
  },

  // ===== SEDONA, ARIZONA =====
  {
    name: 'Hiline Trail', description: 'Sedona\'s most popular advanced mountain bike trail. Technical slickrock sections, tight switchbacks, and stunning red rock exposure. The trail traverses high above the valley with panoramic views of Cathedral Rock and Courthouse Butte.',
    activity_types: ['mtb'], difficulty: 'black', difficulty_label: 'Advanced', technical_rating: 4,
    distance_meters: 9700, elevation_gain_meters: 274, elevation_loss_meters: 274, max_elevation_meters: 1341, min_elevation_meters: 1219,
    trail_type: 'out_and_back', surface_type: ['slickrock', 'singletrack', 'rock'], lat: 34.8310, lng: -111.7670,
    city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Red Rock Pass (Coconino NF)',
    rating: 4.8, review_count: 1456, ride_count: 15600, best_seasons: ['fall', 'winter', 'spring'],
  },
  {
    name: 'Hangover Trail', description: 'One of Sedona\'s most exposed and technical trails. Narrow ledges, steep drop-offs, and demanding slickrock sections high above the valley floor. Not for the faint of heart, but the views are extraordinary.',
    activity_types: ['mtb', 'hiking'], difficulty: 'double_black', difficulty_label: 'Expert', technical_rating: 5,
    distance_meters: 4800, elevation_gain_meters: 198, elevation_loss_meters: 198, max_elevation_meters: 1372, min_elevation_meters: 1250,
    trail_type: 'out_and_back', surface_type: ['slickrock', 'rock', 'singletrack'], lat: 34.8280, lng: -111.7700,
    city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Red Rock Pass (Coconino NF)',
    rating: 4.9, review_count: 876, ride_count: 8900, best_seasons: ['fall', 'winter', 'spring'],
  },
  {
    name: 'Cathedral Rock Trail', description: 'A short but steep scramble to Sedona\'s most photographed landmark. The final section requires hand-over-hand climbing on smooth sandstone slabs. The views of Oak Creek Canyon and the surrounding red rock formations are iconic.',
    activity_types: ['hiking'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 3,
    distance_meters: 1800, elevation_gain_meters: 183, elevation_loss_meters: 183, max_elevation_meters: 1402, min_elevation_meters: 1219,
    trail_type: 'out_and_back', surface_type: ['rock', 'sandstone', 'dirt'], lat: 34.8226, lng: -111.7897,
    city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Red Rock Pass (Coconino NF)',
    rating: 4.7, review_count: 4567, ride_count: 0, best_seasons: ['fall', 'winter', 'spring'],
  },
  {
    name: 'Broken Arrow Trail', description: 'A Sedona classic combining smooth red slickrock riding with stunning scenery. Passes by Chicken Point with its famous overlook. Good for intermediate riders who want a taste of Sedona slickrock.',
    activity_types: ['mtb', 'hiking'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 3,
    distance_meters: 6400, elevation_gain_meters: 137, elevation_loss_meters: 137, max_elevation_meters: 1310, min_elevation_meters: 1219,
    trail_type: 'out_and_back', surface_type: ['slickrock', 'singletrack', 'dirt'], lat: 34.8350, lng: -111.7780,
    city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Red Rock Pass (Coconino NF)',
    rating: 4.6, review_count: 2345, ride_count: 12400, best_seasons: ['fall', 'winter', 'spring'],
  },
  {
    name: 'West Fork Oak Creek', description: 'A gorgeous canyon hike through towering walls of red and white sandstone with dozens of creek crossings. The fall colors in the narrow canyon are legendary. One of the most popular hikes in Arizona.',
    activity_types: ['hiking'], difficulty: 'green', difficulty_label: 'Beginner', technical_rating: 1,
    distance_meters: 10300, elevation_gain_meters: 122, elevation_loss_meters: 122, max_elevation_meters: 1650, min_elevation_meters: 1585,
    trail_type: 'out_and_back', surface_type: ['dirt', 'rock', 'creek crossings'], lat: 34.9818, lng: -111.7445,
    city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Red Rock Pass (Coconino NF)',
    rating: 4.8, review_count: 5678, ride_count: 0, best_seasons: ['fall', 'spring'],
  },
  {
    name: 'Slim Shady Trail', description: 'Flowy, fast singletrack weaving through juniper forest with punchy climbs and satisfying descents. One of Sedona\'s newer purpose-built mountain bike trails with great drainage and progressive features.',
    activity_types: ['mtb'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 2,
    distance_meters: 5600, elevation_gain_meters: 152, elevation_loss_meters: 152, max_elevation_meters: 1310, min_elevation_meters: 1219,
    trail_type: 'loop', surface_type: ['singletrack', 'dirt'], lat: 34.8400, lng: -111.7500,
    city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: true, permit_name: 'Red Rock Pass (Coconino NF)',
    rating: 4.5, review_count: 654, ride_count: 7800, best_seasons: ['fall', 'winter', 'spring'],
  },

  // ===== LAKE TAHOE, CA/NV =====
  {
    name: 'Flume Trail', description: 'A legendary high-altitude singletrack with jaw-dropping views of Lake Tahoe\'s turquoise waters 1,500 feet below. The trail follows an old logging flume route carved into the mountainside. Best ridden with a shuttle to the top.',
    activity_types: ['mtb', 'hiking'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 3,
    distance_meters: 22500, elevation_gain_meters: 305, elevation_loss_meters: 760, max_elevation_meters: 2530, min_elevation_meters: 1920,
    trail_type: 'point_to_point', surface_type: ['singletrack', 'dirt', 'rock'], lat: 39.2040, lng: -119.9040,
    city: 'Incline Village', state_province: 'Nevada', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.8, review_count: 2345, ride_count: 18900, best_seasons: ['summer', 'fall'],
  },
  {
    name: 'Tahoe Rim Trail - Spooner to Snow Valley Peak', description: 'A spectacular section of the 165-mile Tahoe Rim Trail climbing through pine forest to exposed granite ridgelines with 360-degree views of the lake and the Carson Valley.',
    activity_types: ['hiking', 'mtb', 'trail_running'], difficulty: 'black', difficulty_label: 'Advanced', technical_rating: 3,
    distance_meters: 16100, elevation_gain_meters: 610, elevation_loss_meters: 610, max_elevation_meters: 2860, min_elevation_meters: 2250,
    trail_type: 'out_and_back', surface_type: ['singletrack', 'rock', 'dirt'], lat: 39.1050, lng: -119.9170,
    city: 'Incline Village', state_province: 'Nevada', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.7, review_count: 1234, ride_count: 5600, best_seasons: ['summer', 'fall'],
  },
  {
    name: 'Eagle Falls to Eagle Lake', description: 'A short, steep hike past a picturesque waterfall to a pristine alpine lake nestled in a granite basin. The views of Emerald Bay from the trail are some of the most photographed in Tahoe.',
    activity_types: ['hiking'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 2,
    distance_meters: 3200, elevation_gain_meters: 152, elevation_loss_meters: 152, max_elevation_meters: 2070, min_elevation_meters: 1920,
    trail_type: 'out_and_back', surface_type: ['granite', 'dirt', 'rock'], lat: 38.9530, lng: -120.1110,
    city: 'South Lake Tahoe', state_province: 'California', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.5, review_count: 3456, ride_count: 0, best_seasons: ['summer', 'fall'],
  },
  {
    name: 'Mr. Toad\'s Wild Ride', description: 'One of Tahoe\'s gnarliest descents. A sustained, rocky, root-laden plunge through the forest that demands full attention and a willingness to get bucked. Not for the timid, but a bucket-list ride.',
    activity_types: ['mtb'], difficulty: 'double_black', difficulty_label: 'Expert', technical_rating: 5,
    distance_meters: 6400, elevation_gain_meters: 30, elevation_loss_meters: 550, max_elevation_meters: 2620, min_elevation_meters: 2070,
    trail_type: 'point_to_point', surface_type: ['rock', 'roots', 'singletrack'], lat: 38.8220, lng: -120.0350,
    city: 'South Lake Tahoe', state_province: 'California', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.7, review_count: 987, ride_count: 8700, best_seasons: ['summer', 'fall'],
  },
  {
    name: 'Rubicon Trail (Hiking)', description: 'A scenic lakeside trail connecting D.L. Bliss and Emerald Bay State Parks. The trail hugs the shoreline with views of the crystal-clear water and passes several secluded beaches perfect for swimming.',
    activity_types: ['hiking', 'trail_running'], difficulty: 'blue', difficulty_label: 'Intermediate', technical_rating: 2,
    distance_meters: 8000, elevation_gain_meters: 183, elevation_loss_meters: 183, max_elevation_meters: 1950, min_elevation_meters: 1897,
    trail_type: 'point_to_point', surface_type: ['dirt', 'granite', 'rock'], lat: 38.9610, lng: -120.0990,
    city: 'South Lake Tahoe', state_province: 'California', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.6, review_count: 2100, ride_count: 0, best_seasons: ['summer', 'fall'],
  },
  {
    name: 'Powerline Trail', description: 'A sustained, technical climb and descent following an old powerline cut through the forest above Tahoe City. Connects into the larger North Shore trail network. Rocky, rooty, and rewarding.',
    activity_types: ['mtb'], difficulty: 'black', difficulty_label: 'Advanced', technical_rating: 4,
    distance_meters: 11300, elevation_gain_meters: 457, elevation_loss_meters: 457, max_elevation_meters: 2320, min_elevation_meters: 1920,
    trail_type: 'out_and_back', surface_type: ['singletrack', 'rock', 'roots'], lat: 39.1720, lng: -120.1450,
    city: 'Tahoe City', state_province: 'California', country: 'United States', country_code: 'US',
    current_condition: 'open', requires_permit: false, permit_name: null,
    rating: 4.4, review_count: 567, ride_count: 6500, best_seasons: ['summer', 'fall'],
  },
];

// ---------------------------------------------------------------------------
// Businesses
// ---------------------------------------------------------------------------

interface SeedBusiness {
  name: string;
  description: string;
  category: string;
  subcategories: string[];
  activity_types: string[];
  address: string;
  city: string;
  state_province: string;
  country: string;
  country_code: string;
  postal_code: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website_url: string;
  hours: Record<string, string>;
  rating: number;
  review_count: number;
  is_spotlight: boolean;
  spotlight_tier: string | null;
  special_offer: string | null;
  tags: string[];
}

const standardHours: Record<string, string> = {
  monday: '8:00 AM - 6:00 PM', tuesday: '8:00 AM - 6:00 PM', wednesday: '8:00 AM - 6:00 PM',
  thursday: '8:00 AM - 6:00 PM', friday: '8:00 AM - 7:00 PM', saturday: '8:00 AM - 7:00 PM',
  sunday: '9:00 AM - 5:00 PM',
};

const guideHours: Record<string, string> = {
  monday: '7:00 AM - 8:00 PM', tuesday: '7:00 AM - 8:00 PM', wednesday: '7:00 AM - 8:00 PM',
  thursday: '7:00 AM - 8:00 PM', friday: '7:00 AM - 8:00 PM', saturday: '6:00 AM - 9:00 PM',
  sunday: '6:00 AM - 9:00 PM',
};

const cafeHours: Record<string, string> = {
  monday: '6:00 AM - 3:00 PM', tuesday: '6:00 AM - 3:00 PM', wednesday: '6:00 AM - 3:00 PM',
  thursday: '6:00 AM - 3:00 PM', friday: '6:00 AM - 3:00 PM', saturday: '6:00 AM - 4:00 PM',
  sunday: '7:00 AM - 2:00 PM',
};

const SEED_BUSINESSES: SeedBusiness[] = [
  // ===== MOAB, UTAH =====
  {
    name: 'Poison Spider Bicycles', description: 'Moab\'s original mountain bike shop, open since 1989. Full-suspension rentals, expert trail advice, and a mechanic crew that has ridden every line in the valley.',
    category: 'bike_shop', subcategories: ['rental', 'repair', 'retail'], activity_types: ['mtb', 'road_cycling'],
    address: '497 N Main St', city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', postal_code: '84532',
    lat: 38.5774, lng: -109.5493, phone: '+1 435-259-7882', email: 'info@poisonspiderbicycles.com', website_url: 'https://poisonspiderbicycles.com',
    hours: standardHours, rating: 4.8, review_count: 312, is_spotlight: true, spotlight_tier: 'founding',
    special_offer: '15% off multi-day rentals booked through Cairn Connect', tags: ['bike rental', 'full suspension', 'trail advice', 'repairs'],
  },
  {
    name: 'Rim Cyclery', description: 'Family-owned bike shop on Center Street with 30+ years in Moab. Known for hand-built wheels and honest sizing advice. Yeti, Santa Cruz, and Guerrilla Gravity demos available.',
    category: 'bike_shop', subcategories: ['rental', 'repair', 'retail', 'demo'], activity_types: ['mtb', 'road_cycling'],
    address: '94 W 100 N', city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', postal_code: '84532',
    lat: 38.5735, lng: -109.5516, phone: '+1 435-259-5333', email: 'shop@rimcyclery.com', website_url: 'https://rimcyclery.com',
    hours: standardHours, rating: 4.7, review_count: 248, is_spotlight: true, spotlight_tier: 'premium',
    special_offer: 'Free hydration pack with any 3+ day rental', tags: ['demo bikes', 'wheel building', 'family-owned'],
  },
  {
    name: 'Moab Desert Adventures', description: 'Small-group guided experiences across the Moab backcountry. Canyoneering, 4x4 tours, guided MTB descents, and multi-day packrafting trips. All guides are WFR certified.',
    category: 'guide_service', subcategories: ['canyoneering', '4x4', 'mtb', 'packrafting'], activity_types: ['hiking', 'mtb', 'kayaking', 'climbing'],
    address: '415 N Main St', city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', postal_code: '84532',
    lat: 38.5761, lng: -109.5495, phone: '+1 435-260-2404', email: 'book@moabdesertadventures.com', website_url: 'https://moabdesertadventures.com',
    hours: guideHours, rating: 4.9, review_count: 187, is_spotlight: true, spotlight_tier: 'standard',
    special_offer: '$50 off any canyoneering trip when you mention Cairn Connect', tags: ['canyoneering', 'guided tours', 'small group', 'WFR certified'],
  },
  {
    name: 'Coyote Shuttle', description: 'Reliable bike and hiker shuttle service covering every major trailhead in the Moab area. Porcupine Rim, Whole Enchilada, Kokopelli -- they run them all.',
    category: 'bike_shuttle', subcategories: ['trailhead shuttle', 'airport transfer'], activity_types: ['mtb', 'hiking', 'trail_running'],
    address: '197 S Main St', city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', postal_code: '84532',
    lat: 38.5701, lng: -109.5502, phone: '+1 435-260-2227', email: 'rides@coyoteshuttle.com', website_url: 'https://coyoteshuttle.com',
    hours: { ...standardHours, saturday: '5:30 AM - 8:00 PM', sunday: '5:30 AM - 7:00 PM' },
    rating: 4.6, review_count: 134, is_spotlight: false, spotlight_tier: null,
    special_offer: '10% off Whole Enchilada shuttles on weekdays', tags: ['bike shuttle', 'Porcupine Rim', 'Whole Enchilada'],
  },
  {
    name: 'Red Rock Bakery & Cafe', description: 'Early-morning fuel stop for riders, hikers, and climbers. Scratch-made pastries, massive breakfast burritos, and espresso. Outdoor patio with a trail conditions chalkboard updated daily.',
    category: 'trailhead_cafe', subcategories: ['bakery', 'coffee', 'breakfast'], activity_types: ['hiking', 'mtb', 'climbing', 'trail_running'],
    address: '74 S Main St', city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', postal_code: '84532',
    lat: 38.5718, lng: -109.5500, phone: '+1 435-259-3941', email: 'eat@redrockbakery.com', website_url: 'https://redrockbakery.com',
    hours: cafeHours, rating: 4.6, review_count: 178, is_spotlight: false, spotlight_tier: null,
    special_offer: null, tags: ['breakfast', 'coffee', 'pastries', 'bike rack', 'trail conditions'],
  },
  {
    name: 'Canyon Voyages Adventure Co.', description: 'Full-service outfitter running rafting, kayaking, and combination 4x4/river trips. Multi-day expeditions through Cataract Canyon and calm-water floats for families.',
    category: 'outfitter', subcategories: ['rafting', 'kayaking', '4x4', 'multi-day trips'], activity_types: ['kayaking', 'whitewater', 'camping'],
    address: '211 N Main St', city: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', postal_code: '84532',
    lat: 38.5752, lng: -109.5497, phone: '+1 435-259-6007', email: 'info@canyonvoyages.com', website_url: 'https://canyonvoyages.com',
    hours: guideHours, rating: 4.8, review_count: 291, is_spotlight: false, spotlight_tier: null,
    special_offer: 'Book a Cataract Canyon trip and get a free dry bag', tags: ['rafting', 'Cataract Canyon', 'multi-day', 'family rafting'],
  },

  // ===== BEND, OREGON =====
  {
    name: 'Pine Mountain Sports', description: 'Bend\'s go-to bike shop for trail recommendations and quality rentals. Staff rides daily and knows every connector in the Phil\'s Trail network. Full suspension and e-bike rentals available.',
    category: 'bike_shop', subcategories: ['rental', 'repair', 'retail'], activity_types: ['mtb', 'road_cycling', 'nordic_skiing'],
    address: '255 SW Century Dr', city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US', postal_code: '97702',
    lat: 44.0542, lng: -121.3258, phone: '+1 541-385-8080', email: 'info@pinemountainsports.com', website_url: 'https://pinemountainsports.com',
    hours: standardHours, rating: 4.7, review_count: 423, is_spotlight: true, spotlight_tier: 'founding',
    special_offer: 'Free trail map with any rental', tags: ['bike rental', 'e-bikes', 'trail maps', 'Phil\'s Trail experts'],
  },
  {
    name: 'Cog Wild Mountain Bike Tours', description: 'Guided mountain bike tours through Bend\'s best trails. Half-day, full-day, and multi-day backcountry MTB trips. Perfect for riders who want local knowledge and curated routes.',
    category: 'guide_service', subcategories: ['mtb tours', 'skills clinics'], activity_types: ['mtb'],
    address: '19221 SW Century Dr', city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US', postal_code: '97702',
    lat: 44.0380, lng: -121.3420, phone: '+1 541-385-7002', email: 'ride@cogwild.com', website_url: 'https://cogwild.com',
    hours: guideHours, rating: 4.9, review_count: 267, is_spotlight: true, spotlight_tier: 'standard',
    special_offer: null, tags: ['guided MTB', 'skills clinic', 'backcountry', 'local knowledge'],
  },
  {
    name: 'Bend Brewing Company', description: 'Local brewery with an outdoor patio overlooking Mirror Pond. Popular post-ride gathering spot with hearty pub fare and award-winning craft beers. Bike racks out front.',
    category: 'trailhead_cafe', subcategories: ['brewery', 'restaurant'], activity_types: ['mtb', 'hiking', 'trail_running', 'kayaking'],
    address: '1019 NW Brooks St', city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US', postal_code: '97703',
    lat: 44.0590, lng: -121.3165, phone: '+1 541-383-1599', email: 'info@bendbrewingco.com', website_url: 'https://bendbrewingco.com',
    hours: { ...standardHours, monday: '11:00 AM - 9:00 PM', tuesday: '11:00 AM - 9:00 PM', wednesday: '11:00 AM - 9:00 PM', thursday: '11:00 AM - 9:00 PM', friday: '11:00 AM - 10:00 PM', saturday: '11:00 AM - 10:00 PM', sunday: '11:00 AM - 8:00 PM' },
    rating: 4.5, review_count: 534, is_spotlight: false, spotlight_tier: null,
    special_offer: null, tags: ['brewery', 'post-ride', 'patio', 'pub fare'],
  },
  {
    name: 'Tumalo Creek Kayak & Canoe', description: 'Kayak, canoe, and SUP rentals on the Deschutes River. Guided tours of the Cascade Lakes and river instruction for all levels. Free shuttle to put-in points.',
    category: 'kayak_sup', subcategories: ['kayak rental', 'SUP rental', 'guided tours'], activity_types: ['kayaking', 'standup_paddle'],
    address: '805 SW Industrial Way', city: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US', postal_code: '97702',
    lat: 44.0450, lng: -121.3190, phone: '+1 541-317-9407', email: 'paddle@tumalocreek.com', website_url: 'https://tumalocreek.com',
    hours: { ...standardHours, monday: '9:00 AM - 6:00 PM', tuesday: '9:00 AM - 6:00 PM', wednesday: '9:00 AM - 6:00 PM', thursday: '9:00 AM - 6:00 PM', friday: '9:00 AM - 7:00 PM', saturday: '8:00 AM - 7:00 PM', sunday: '8:00 AM - 6:00 PM' },
    rating: 4.7, review_count: 189, is_spotlight: false, spotlight_tier: null,
    special_offer: '15% off sunset paddle tours', tags: ['kayak', 'SUP', 'Deschutes River', 'guided paddle', 'family-friendly'],
  },

  // ===== WHISTLER, BC =====
  {
    name: 'Fanatyk Co. Ski & Cycle', description: 'Whistler Village\'s premier bike and ski shop. Expert bike park tune-ups, downhill rentals, and a knowledgeable staff that rides or skis daily. Summer bike park setups and winter ski boot fitting specialists.',
    category: 'bike_shop', subcategories: ['rental', 'repair', 'retail', 'ski'], activity_types: ['mtb', 'skiing', 'snowboarding'],
    address: '4433 Sundial Place', city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA', postal_code: 'V8E 1G8',
    lat: 50.1145, lng: -122.9575, phone: '+1 604-938-9455', email: 'info@fanatykco.com', website_url: 'https://fanatykco.com',
    hours: standardHours, rating: 4.8, review_count: 567, is_spotlight: true, spotlight_tier: 'founding',
    special_offer: '20% off bike park rentals for 3+ day bookings', tags: ['bike park rentals', 'downhill', 'ski shop', 'expert tune-ups'],
  },
  {
    name: 'Whistler Alpine Guides', description: 'Year-round guiding in the Coast Mountains. Summer alpine hiking, scrambling, and glacier travel. Winter backcountry ski touring and avalanche courses. ACMG-certified guides.',
    category: 'guide_service', subcategories: ['alpine', 'glacier', 'backcountry ski'], activity_types: ['hiking', 'skiing', 'climbing'],
    address: '4293 Mountain Square', city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA', postal_code: 'V8E 1B8',
    lat: 50.1150, lng: -122.9560, phone: '+1 604-938-9242', email: 'book@whistlerguides.com', website_url: 'https://whistlerguides.com',
    hours: guideHours, rating: 4.9, review_count: 312, is_spotlight: true, spotlight_tier: 'premium',
    special_offer: null, tags: ['alpine guides', 'ACMG certified', 'glacier travel', 'backcountry skiing'],
  },
  {
    name: 'Handlebar Cafe', description: 'A beloved Whistler institution where mountain bikers refuel after a day in the bike park. Huge portions, cold drinks, and walls covered in bike memorabilia. The patio fills up fast on sunny afternoons.',
    category: 'trailhead_cafe', subcategories: ['restaurant', 'bar'], activity_types: ['mtb', 'hiking', 'skiing'],
    address: '4314 Main St', city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA', postal_code: 'V8E 1B1',
    lat: 50.1160, lng: -122.9550, phone: '+1 604-932-4540', email: 'info@handlebar.ca', website_url: 'https://handlebar.ca',
    hours: { ...standardHours, monday: '11:00 AM - 11:00 PM', tuesday: '11:00 AM - 11:00 PM', wednesday: '11:00 AM - 11:00 PM', thursday: '11:00 AM - 11:00 PM', friday: '11:00 AM - 12:00 AM', saturday: '11:00 AM - 12:00 AM', sunday: '11:00 AM - 10:00 PM' },
    rating: 4.5, review_count: 890, is_spotlight: false, spotlight_tier: null,
    special_offer: null, tags: ['post-ride', 'burgers', 'patio', 'bike park'],
  },
  {
    name: 'Whistler Hostel', description: 'Budget-friendly base camp steps from the Village gondola. Dorm beds, private rooms, and a communal kitchen full of stoke. Gear storage, bike wash, and a hot tub. The common room is where adventures get planned.',
    category: 'adventure_hostel', subcategories: ['dorms', 'private rooms'], activity_types: ['mtb', 'skiing', 'hiking', 'snowboarding'],
    address: '1035 Legacy Way', city: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA', postal_code: 'V8E 0M3',
    lat: 50.1130, lng: -122.9590, phone: '+1 604-962-0025', email: 'stay@whistlerhostel.com', website_url: 'https://whistlerhostel.com',
    hours: { monday: '7:00 AM - 10:00 PM', tuesday: '7:00 AM - 10:00 PM', wednesday: '7:00 AM - 10:00 PM', thursday: '7:00 AM - 10:00 PM', friday: '7:00 AM - 11:00 PM', saturday: '7:00 AM - 11:00 PM', sunday: '7:00 AM - 10:00 PM' },
    rating: 4.3, review_count: 678, is_spotlight: false, spotlight_tier: null,
    special_offer: null, tags: ['hostel', 'budget', 'hot tub', 'bike wash', 'village gondola'],
  },

  // ===== SEDONA, ARIZONA =====
  {
    name: 'Over the Edge Sedona', description: 'Full-service mountain bike shop with premium trail bike and e-bike rentals. The staff lives and rides Sedona\'s trails and will build you the perfect route based on your skill level and time.',
    category: 'bike_shop', subcategories: ['rental', 'repair', 'retail'], activity_types: ['mtb'],
    address: '1695 W Hwy 89A', city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US', postal_code: '86336',
    lat: 34.8780, lng: -111.7820, phone: '+1 928-282-1106', email: 'info@otesedona.com', website_url: 'https://otesedona.com',
    hours: standardHours, rating: 4.8, review_count: 456, is_spotlight: true, spotlight_tier: 'founding',
    special_offer: 'Free trail snacks with any full-day rental', tags: ['bike rental', 'e-bikes', 'trail experts', 'Sedona trails'],
  },
  {
    name: 'Red Rock Western Jeep Tours', description: 'Guided off-road Jeep tours through Sedona\'s most scenic backcountry routes. Sunset tours, vortex tours, and custom adventures. Knowledgeable guides share geology and local history.',
    category: 'guide_service', subcategories: ['jeep tours', 'sunset tours'], activity_types: ['hiking'],
    address: '270 N Hwy 89A', city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US', postal_code: '86336',
    lat: 34.8710, lng: -111.7610, phone: '+1 928-282-6826', email: 'tours@redrockjeep.com', website_url: 'https://redrockjeep.com',
    hours: guideHours, rating: 4.7, review_count: 890, is_spotlight: true, spotlight_tier: 'standard',
    special_offer: '$20 off any sunset tour', tags: ['jeep tours', 'sunset', 'vortex', 'backcountry'],
  },
  {
    name: 'Sedona Trail House', description: 'Cozy cafe right by the trailheads with locally roasted coffee, trail mix, and hearty sandwiches. The covered patio is the perfect spot to decompress after a ride or hike. They also sell local trail maps.',
    category: 'trailhead_cafe', subcategories: ['cafe', 'coffee', 'light meals'], activity_types: ['mtb', 'hiking', 'trail_running'],
    address: '371 Forest Rd', city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US', postal_code: '86336',
    lat: 34.8650, lng: -111.7680, phone: '+1 928-282-0450', email: 'hello@sedonatrailhouse.com', website_url: 'https://sedonatrailhouse.com',
    hours: cafeHours, rating: 4.6, review_count: 234, is_spotlight: false, spotlight_tier: null,
    special_offer: null, tags: ['coffee', 'trail snacks', 'maps', 'trailhead'],
  },
  {
    name: 'Sedona Adventure Center', description: 'One-stop shop for outdoor gear rental. Bikes, hiking poles, camping gear, GPS units, and bear spray. Helpful staff will customize a gear package for your itinerary.',
    category: 'gear_rental', subcategories: ['camping gear', 'bike rental', 'hiking gear'], activity_types: ['hiking', 'mtb', 'camping'],
    address: '2081 W Hwy 89A', city: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US', postal_code: '86336',
    lat: 34.8750, lng: -111.7900, phone: '+1 928-282-5500', email: 'rent@sedonaadventure.com', website_url: 'https://sedonaadventure.com',
    hours: standardHours, rating: 4.4, review_count: 145, is_spotlight: false, spotlight_tier: null,
    special_offer: 'Free water bottle with gear package rental', tags: ['gear rental', 'bikes', 'camping', 'hiking gear'],
  },

  // ===== LAKE TAHOE, CA/NV =====
  {
    name: 'Flume Trail Bikes', description: 'The only bike shop at the Flume Trail trailhead. Full-suspension rentals optimized for the Flume and shuttle service to the top. Staff knows every section of the Tahoe Rim Trail.',
    category: 'bike_shop', subcategories: ['rental', 'shuttle'], activity_types: ['mtb'],
    address: '1115 Tunnel Creek Rd', city: 'Incline Village', state_province: 'Nevada', country: 'United States', country_code: 'US', postal_code: '89451',
    lat: 39.2020, lng: -119.9060, phone: '+1 775-298-2501', email: 'ride@flumetrailbikes.com', website_url: 'https://flumetrailbikes.com',
    hours: { ...standardHours, monday: '8:00 AM - 5:00 PM', tuesday: '8:00 AM - 5:00 PM', wednesday: '8:00 AM - 5:00 PM', thursday: '8:00 AM - 5:00 PM', friday: '8:00 AM - 6:00 PM', saturday: '7:30 AM - 6:00 PM', sunday: '7:30 AM - 5:00 PM' },
    rating: 4.7, review_count: 345, is_spotlight: true, spotlight_tier: 'founding',
    special_offer: 'Shuttle + rental combo saves $20', tags: ['Flume Trail', 'shuttle', 'mountain bikes', 'Tahoe Rim Trail'],
  },
  {
    name: 'Tahoe Adventure Company', description: 'Multi-sport outfitter offering guided hikes, kayak tours of Emerald Bay, SUP lessons, and winter snowshoe treks. All gear included with guided trips.',
    category: 'guide_service', subcategories: ['hiking', 'kayak tours', 'SUP', 'snowshoe'], activity_types: ['hiking', 'kayaking', 'standup_paddle', 'snowshoeing'],
    address: '10065 West River St', city: 'Truckee', state_province: 'California', country: 'United States', country_code: 'US', postal_code: '96161',
    lat: 39.3262, lng: -120.1831, phone: '+1 530-913-9212', email: 'info@tahoeadventurecompany.com', website_url: 'https://tahoeadventurecompany.com',
    hours: guideHours, rating: 4.8, review_count: 412, is_spotlight: true, spotlight_tier: 'premium',
    special_offer: null, tags: ['guided hikes', 'kayak tours', 'Emerald Bay', 'SUP lessons', 'snowshoe'],
  },
  {
    name: 'Tahoe Sports Hub', description: 'Truckee\'s local gear shop with ski and bike rentals, tune-ups, and a great selection of outdoor apparel. Friendly and knowledgeable -- they will hook you up with the right gear for the season.',
    category: 'outdoor_gear_shop', subcategories: ['rental', 'retail', 'tune-ups'], activity_types: ['mtb', 'skiing', 'snowboarding', 'hiking'],
    address: '10095 West River St', city: 'Truckee', state_province: 'California', country: 'United States', country_code: 'US', postal_code: '96161',
    lat: 39.3260, lng: -120.1835, phone: '+1 530-582-4510', email: 'info@tahoesportshub.com', website_url: 'https://tahoesportshub.com',
    hours: standardHours, rating: 4.5, review_count: 267, is_spotlight: false, spotlight_tier: null,
    special_offer: null, tags: ['ski rentals', 'bike rentals', 'outdoor gear', 'Truckee'],
  },
  {
    name: 'Donner Lake Kitchen', description: 'A cozy morning cafe near Donner Pass popular with skiers, hikers, and cyclists. Hearty breakfasts, fresh-baked goods, and locally roasted coffee. The perfect fuel-up spot before hitting the trails.',
    category: 'trailhead_cafe', subcategories: ['breakfast', 'bakery', 'coffee'], activity_types: ['hiking', 'skiing', 'mtb', 'trail_running'],
    address: '12830 Donner Pass Rd', city: 'Truckee', state_province: 'California', country: 'United States', country_code: 'US', postal_code: '96161',
    lat: 39.3320, lng: -120.2340, phone: '+1 530-587-3342', email: 'info@donnerlakekitchen.com', website_url: 'https://donnerlakekitchen.com',
    hours: cafeHours, rating: 4.6, review_count: 189, is_spotlight: false, spotlight_tier: null,
    special_offer: null, tags: ['breakfast', 'bakery', 'coffee', 'skiers', 'hikers'],
  },
];

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

interface SeedReview {
  trail_name: string | null;
  business_name: string | null;
  entity_type: 'trail' | 'business';
  user_index: number; // index into SEED_USERS
  rating: number;
  title: string;
  body: string;
}

const SEED_REVIEWS: SeedReview[] = [
  // Moab trail reviews
  { trail_name: 'Slickrock Trail', business_name: null, entity_type: 'trail', user_index: 1, rating: 5, title: 'Lives up to the hype', body: 'There is nothing else like riding Slickrock. The petrified dunes give you traction at angles that feel impossible. We rode the practice loop first, then committed to the full 10-mile loop. Bring more water than you think.' },
  { trail_name: 'Slickrock Trail', business_name: null, entity_type: 'trail', user_index: 4, rating: 4, title: 'Incredible but exhausting', body: 'Did this in April with perfect weather. The trail is way more physically demanding than it looks on paper. The constant ups and downs on sandstone drain your legs fast. Absolutely stunning though.' },
  { trail_name: 'Porcupine Rim', business_name: null, entity_type: 'trail', user_index: 2, rating: 5, title: 'Incredible exposure on Porcupine', body: 'The Colorado River views from the rim are worth every pedal stroke. The descent is seriously gnarly though. Shuttle from Poison Spider is the way to go.' },
  { trail_name: 'Corona Arch Trail', business_name: null, entity_type: 'trail', user_index: 5, rating: 5, title: 'Corona Arch is stunning', body: 'Short enough for a morning out, dramatic enough to feel like a real adventure. The scramble sections are fun without being scary. One of the best bang-for-your-buck hikes in the area.' },
  { trail_name: 'Amasa Back', business_name: null, entity_type: 'trail', user_index: 6, rating: 5, title: 'Cliffhanger is wild', body: 'Did the full Amasa Back with the Cliffhanger option. The exposure on Cliffhanger is real deal. Not for beginners but the views are worth it if you have the skills.' },
  { trail_name: 'Gemini Bridges', business_name: null, entity_type: 'trail', user_index: 7, rating: 4, title: 'Perfect for my first Moab ride', body: 'Shuttled to the top and it was a great intro to desert riding. The bridges themselves are amazing to see. Trail is mostly smooth with a few rocky sections.' },

  // Bend trail reviews
  { trail_name: 'Phil\'s Trail Complex', business_name: null, entity_type: 'trail', user_index: 0, rating: 5, title: 'Best trail system in the PNW', body: 'Spent a week riding Phil\'s and barely scratched the surface. The flow trails are perfectly maintained and the network lets you build any length ride. Pumice soil drains fast after rain.' },
  { trail_name: 'South Sister Summit', business_name: null, entity_type: 'trail', user_index: 5, rating: 5, title: 'Bucket list summit', body: 'Started at 5am and reached the top by 10. The last 1000 feet of scree is a grind but the 360 panorama from the summit is beyond words. Could see every Cascade volcano.' },
  { trail_name: 'Tumalo Falls Trail', business_name: null, entity_type: 'trail', user_index: 7, rating: 4, title: 'Beautiful waterfall hike', body: 'The main falls are spectacular and the upper cascades are equally gorgeous with fewer people. Gets crowded on summer weekends so go early.' },

  // Whistler trail reviews
  { trail_name: 'A-Line', business_name: null, entity_type: 'trail', user_index: 6, rating: 5, title: 'Every jumper\'s dream', body: 'Finally rode A-Line and it lives up to every video I have ever watched. The jumps are perfectly shaped and predictable. Lapped it until my arms gave out.' },
  { trail_name: 'Comfortably Numb', business_name: null, entity_type: 'trail', user_index: 0, rating: 5, title: 'XC perfection', body: 'This trail is flow incarnate. Smooth singletrack through old-growth forest with just the right amount of challenge. The length is perfect for a half-day ride.' },
  { trail_name: 'High Note Trail', business_name: null, entity_type: 'trail', user_index: 5, rating: 4, title: 'Alpine views for days', body: 'The views of Black Tusk and the surrounding peaks are jaw-dropping. Trail is easy enough for most hikers but you need to take the gondola up which adds cost.' },

  // Sedona trail reviews
  { trail_name: 'Hiline Trail', business_name: null, entity_type: 'trail', user_index: 0, rating: 5, title: 'Technical masterpiece', body: 'Hiline combines technical challenge with views that make you stop mid-pedal stroke. The slickrock sections are grippy and the exposure keeps you focused. Rode it three times in two days.' },
  { trail_name: 'Cathedral Rock Trail', business_name: null, entity_type: 'trail', user_index: 3, rating: 5, title: 'Worth the crowds', body: 'Yes it is popular for a reason. The scramble to the top is exhilarating and the views in every direction are incredible. Go at sunrise to beat the crowds and the heat.' },
  { trail_name: 'West Fork Oak Creek', business_name: null, entity_type: 'trail', user_index: 8, rating: 5, title: 'Most beautiful canyon hike', body: 'Hiked this in October and the fall colors in the canyon were breathtaking. Dozens of creek crossings keep it interesting. Easy enough for all ages but still feels like an adventure.' },

  // Tahoe trail reviews
  { trail_name: 'Flume Trail', business_name: null, entity_type: 'trail', user_index: 0, rating: 5, title: 'Tahoe\'s must-ride', body: 'The views of the lake from 1500 feet above are surreal. The singletrack is smooth and fast with great exposure. Shuttle to the top is worth every penny.' },
  { trail_name: 'Mr. Toad\'s Wild Ride', business_name: null, entity_type: 'trail', user_index: 6, rating: 4, title: 'Hang on tight', body: 'This trail earned its name. It is relentlessly rocky and steep. My hands were burning after the descent. Not pretty riding but it is an experience you will not forget.' },
  { trail_name: 'Eagle Falls to Eagle Lake', business_name: null, entity_type: 'trail', user_index: 3, rating: 4, title: 'Quick and gorgeous', body: 'A short hike with huge rewards. The waterfall is beautiful and Eagle Lake is serene. Gets busy on summer weekends but early morning visits are peaceful.' },

  // Business reviews
  { trail_name: null, business_name: 'Poison Spider Bicycles', entity_type: 'business', user_index: 6, rating: 5, title: 'Best bike shop in Moab, period', body: 'Rented a Ripmo for three days and it was dialed perfectly. Staff helped me pick lines on Porcupine Rim I never would have found on my own. Trailside repair kit included at no extra charge.' },
  { trail_name: null, business_name: 'Poison Spider Bicycles', entity_type: 'business', user_index: 1, rating: 5, title: 'Nailed the bike fit', body: 'They took the time to set up the suspension for my weight and riding style. The rental felt like my own bike by the second ride. Will be back every year.' },
  { trail_name: null, business_name: 'Moab Desert Adventures', entity_type: 'business', user_index: 3, rating: 5, title: 'Life-changing canyoneering', body: 'Booked a full-day slot canyon trip and it exceeded every expectation. Our guide knew the geology inside and out and kept us laughing the whole time. Worth every penny.' },
  { trail_name: null, business_name: 'Red Rock Bakery & Cafe', entity_type: 'business', user_index: 4, rating: 4, title: 'Great fuel before the trail', body: 'Breakfast burrito was massive, coffee was strong, and the vibe was perfect -- half the tables were people hunched over trail maps. The trail conditions chalkboard is a nice touch.' },
  { trail_name: null, business_name: 'Pine Mountain Sports', entity_type: 'business', user_index: 0, rating: 5, title: 'Bend locals know best', body: 'The staff built me a custom loop hitting all the best trails in the Phil\'s network based on my skill level. Rental bike was in perfect condition. Great shop.' },
  { trail_name: null, business_name: 'Fanatyk Co. Ski & Cycle', entity_type: 'business', user_index: 6, rating: 5, title: 'Dialed bike park setup', body: 'Had my bike tuned specifically for the Whistler Bike Park and they nailed it. Brake bleed, suspension setup, tire pressure recommendations for every trail type. These guys know their stuff.' },
  { trail_name: null, business_name: 'Over the Edge Sedona', entity_type: 'business', user_index: 0, rating: 5, title: 'Perfect rental experience', body: 'Rented a Yeti SB130 and it was perfect for Sedona terrain. Staff recommended a route combining Hiline and Broken Arrow that was the highlight of my trip.' },
  { trail_name: null, business_name: 'Flume Trail Bikes', entity_type: 'business', user_index: 2, rating: 5, title: 'Shuttle + rental combo is the way', body: 'Got the shuttle and rental package and it made the Flume Trail experience seamless. Bike was great, shuttle was on time, and the staff gave us tips on the best viewpoints.' },
  { trail_name: null, business_name: 'Tahoe Adventure Company', entity_type: 'business', user_index: 8, rating: 5, title: 'Incredible kayak tour', body: 'Did the Emerald Bay kayak tour and the guide was fantastic. Paddled right up to Fannette Island and learned about the history of the area. All gear included and top quality.' },
];

// ---------------------------------------------------------------------------
// Activity Posts
// ---------------------------------------------------------------------------

interface SeedActivityPost {
  user_index: number;
  post_type: string;
  activity_type: string;
  title: string;
  description: string;
  location_name: string;
  lat: number;
  lng: number;
  trail_name: string | null;
  activity_date_offset: number; // days from now
  skill_level: string;
  max_participants: number;
  permit_required: boolean;
  permit_type: string | null;
  gear_required: string[];
}

const SEED_ACTIVITY_POSTS: SeedActivityPost[] = [
  // Moab
  { user_index: 0, post_type: 'im_going', activity_type: 'mtb', title: 'Sunrise Slickrock session', description: 'Hitting Slickrock at first light before the heat kicks in. Planning to ride the full loop. Happy to have company if you can keep a moderate pace.', location_name: 'Slickrock Trail, Sand Flats', lat: 38.5912, lng: -109.5128, trail_name: 'Slickrock Trail', activity_date_offset: 3, skill_level: 'intermediate', max_participants: 4, permit_required: false, permit_type: null, gear_required: ['full-suspension bike', 'helmet', '3L water minimum'] },
  { user_index: 1, post_type: 'open_permit', activity_type: 'kayaking', title: '2 open spots - Cataract Canyon 3-day', description: 'Our group scored a 3-day Cataract Canyon permit and two people dropped. Looking for experienced paddlers comfortable in Class III-IV whitewater.', location_name: 'Cataract Canyon, Colorado River', lat: 38.4250, lng: -109.8800, trail_name: null, activity_date_offset: 12, skill_level: 'advanced', max_participants: 8, permit_required: true, permit_type: 'Cataract Canyon River Permit', gear_required: ['PFD', 'dry bag', 'sleeping bag'] },
  { user_index: 4, post_type: 'lfg', activity_type: 'mtb', title: 'Porcupine Rim shuttle crew needed', description: 'Need 2-3 more riders to split a Coyote Shuttle for Porcupine Rim. Meeting at Poison Spider at 8am. Strong intermediate to advanced riders preferred.', location_name: 'Porcupine Rim Trailhead', lat: 38.5955, lng: -109.4432, trail_name: 'Porcupine Rim', activity_date_offset: 5, skill_level: 'advanced', max_participants: 6, permit_required: false, permit_type: null, gear_required: ['full-suspension bike', 'helmet', 'knee pads'] },

  // Bend
  { user_index: 7, post_type: 'im_going', activity_type: 'trail_running', title: 'Deschutes River morning run', description: 'Easy-paced 10K along the Deschutes River Trail. Starting from the Old Mill District. All paces welcome.', location_name: 'Deschutes River Trail', lat: 44.0491, lng: -121.3335, trail_name: 'Deschutes River Trail', activity_date_offset: 2, skill_level: 'beginner', max_participants: 8, permit_required: false, permit_type: null, gear_required: ['trail shoes', 'water bottle'] },
  { user_index: 0, post_type: 'lfg', activity_type: 'mtb', title: 'Phil\'s Trail after-work ride', description: 'Looking for riding buddies for a 2-hour loop through Phil\'s and Whoops. Meeting at the Phil\'s trailhead parking lot at 5pm. Blue-level riders.', location_name: 'Phil\'s Trail, Bend', lat: 44.0342, lng: -121.3548, trail_name: 'Phil\'s Trail Complex', activity_date_offset: 1, skill_level: 'intermediate', max_participants: 6, permit_required: false, permit_type: null, gear_required: ['mountain bike', 'helmet'] },

  // Whistler
  { user_index: 6, post_type: 'im_going', activity_type: 'mtb', title: 'A-Line laps all day', description: 'Planning to spend the whole day lapping A-Line and Dirt Merchant. Got a season pass and looking for people to session with. Let\'s get after it.', location_name: 'Whistler Bike Park', lat: 50.0866, lng: -122.9570, trail_name: 'A-Line', activity_date_offset: 14, skill_level: 'intermediate', max_participants: 5, permit_required: false, permit_type: null, gear_required: ['full-face helmet', 'body armor', 'full-suspension bike'] },
  { user_index: 5, post_type: 'lfg', activity_type: 'hiking', title: 'High Note Trail hike', description: 'Doing the High Note Trail this weekend. Planning to take the gondola up and hike across. Looking for hiking partners who enjoy a moderate pace with lots of photo stops.', location_name: 'High Note Trail, Whistler', lat: 50.0621, lng: -122.9480, trail_name: 'High Note Trail', activity_date_offset: 6, skill_level: 'intermediate', max_participants: 6, permit_required: false, permit_type: null, gear_required: ['hiking boots', 'rain jacket', 'lunch'] },

  // Sedona
  { user_index: 0, post_type: 'im_going', activity_type: 'mtb', title: 'Hiline sunrise ride', description: 'Riding Hiline at dawn when the light on the red rocks is magical. Fast-paced ride with some session time on the technical sections.', location_name: 'Hiline Trail, Sedona', lat: 34.8310, lng: -111.7670, trail_name: 'Hiline Trail', activity_date_offset: 4, skill_level: 'advanced', max_participants: 4, permit_required: false, permit_type: null, gear_required: ['full-suspension bike', 'helmet', '2L water'] },
  { user_index: 3, post_type: 'lfg', activity_type: 'hiking', title: 'Cathedral Rock sunrise scramble', description: 'Heading up Cathedral Rock for sunrise this Saturday. The scramble is moderate but bring sticky shoes. Meeting at the Back O\' Beyond trailhead at 5:30am.', location_name: 'Cathedral Rock, Sedona', lat: 34.8226, lng: -111.7897, trail_name: 'Cathedral Rock Trail', activity_date_offset: 3, skill_level: 'intermediate', max_participants: 6, permit_required: false, permit_type: null, gear_required: ['hiking shoes with good grip', 'headlamp', 'water'] },

  // Lake Tahoe
  { user_index: 2, post_type: 'im_going', activity_type: 'mtb', title: 'Flume Trail shuttle ride', description: 'Doing the Flume Trail with a shuttle to the top. One of the most scenic rides you will ever do. Moderate pace with lots of photo stops. Meet at Flume Trail Bikes at 9am.', location_name: 'Flume Trail, Lake Tahoe', lat: 39.2040, lng: -119.9040, trail_name: 'Flume Trail', activity_date_offset: 7, skill_level: 'intermediate', max_participants: 6, permit_required: false, permit_type: null, gear_required: ['mountain bike', 'helmet', 'camera'] },
  { user_index: 8, post_type: 'lfg', activity_type: 'kayaking', title: 'Emerald Bay paddle', description: 'Planning a morning kayak around Emerald Bay. Calm conditions expected. All levels welcome. Renting from Tahoe Adventure Company at 8am.', location_name: 'Emerald Bay, Lake Tahoe', lat: 38.9530, lng: -120.0990, trail_name: null, activity_date_offset: 5, skill_level: 'beginner', max_participants: 8, permit_required: false, permit_type: null, gear_required: ['sunscreen', 'dry bag for phone'] },
];

// ---------------------------------------------------------------------------
// Region Highlights
// ---------------------------------------------------------------------------

interface SeedRegionHighlight {
  region_name: string;
  city_slug: string;
  lat: number;
  lng: number;
  activity_slug: string;
  activity_label: string;
  activity_emoji: string;
  trail_count: number;
  business_count: number;
  active_posts_count: number;
  is_seasonal: boolean;
  best_season: string | null;
}

const SEED_REGION_HIGHLIGHTS: SeedRegionHighlight[] = [
  // Moab
  { region_name: 'Moab', city_slug: 'moab_ut', lat: 38.5733, lng: -109.5498, activity_slug: 'mtb', activity_label: 'Mountain Biking', activity_emoji: '\u{1F6B5}', trail_count: 147, business_count: 18, active_posts_count: 34, is_seasonal: true, best_season: 'spring' },
  { region_name: 'Moab', city_slug: 'moab_ut', lat: 38.5733, lng: -109.5498, activity_slug: 'hiking', activity_label: 'Hiking', activity_emoji: '\u{1F97E}', trail_count: 93, business_count: 11, active_posts_count: 22, is_seasonal: false, best_season: null },
  { region_name: 'Moab', city_slug: 'moab_ut', lat: 38.5733, lng: -109.5498, activity_slug: 'climbing', activity_label: 'Rock Climbing', activity_emoji: '\u{1F9D7}', trail_count: 52, business_count: 7, active_posts_count: 15, is_seasonal: true, best_season: 'fall' },
  { region_name: 'Moab', city_slug: 'moab_ut', lat: 38.5733, lng: -109.5498, activity_slug: 'kayaking', activity_label: 'Kayaking / Paddling', activity_emoji: '\u{1F6F6}', trail_count: 12, business_count: 5, active_posts_count: 9, is_seasonal: true, best_season: 'summer' },

  // Bend
  { region_name: 'Bend', city_slug: 'bend_or', lat: 44.0582, lng: -121.3153, activity_slug: 'mtb', activity_label: 'Mountain Biking', activity_emoji: '\u{1F6B5}', trail_count: 198, business_count: 14, active_posts_count: 42, is_seasonal: true, best_season: 'summer' },
  { region_name: 'Bend', city_slug: 'bend_or', lat: 44.0582, lng: -121.3153, activity_slug: 'hiking', activity_label: 'Hiking', activity_emoji: '\u{1F97E}', trail_count: 124, business_count: 8, active_posts_count: 28, is_seasonal: false, best_season: null },
  { region_name: 'Bend', city_slug: 'bend_or', lat: 44.0582, lng: -121.3153, activity_slug: 'trail_running', activity_label: 'Trail Running', activity_emoji: '\u{1F3C3}', trail_count: 86, business_count: 5, active_posts_count: 18, is_seasonal: false, best_season: null },
  { region_name: 'Bend', city_slug: 'bend_or', lat: 44.0582, lng: -121.3153, activity_slug: 'skiing', activity_label: 'Skiing', activity_emoji: '\u26F7\uFE0F', trail_count: 45, business_count: 12, active_posts_count: 24, is_seasonal: true, best_season: 'winter' },

  // Whistler
  { region_name: 'Whistler', city_slug: 'whistler_bc', lat: 50.1163, lng: -122.9574, activity_slug: 'mtb', activity_label: 'Mountain Biking', activity_emoji: '\u{1F6B5}', trail_count: 312, business_count: 22, active_posts_count: 67, is_seasonal: true, best_season: 'summer' },
  { region_name: 'Whistler', city_slug: 'whistler_bc', lat: 50.1163, lng: -122.9574, activity_slug: 'skiing', activity_label: 'Skiing', activity_emoji: '\u26F7\uFE0F', trail_count: 200, business_count: 35, active_posts_count: 55, is_seasonal: true, best_season: 'winter' },
  { region_name: 'Whistler', city_slug: 'whistler_bc', lat: 50.1163, lng: -122.9574, activity_slug: 'hiking', activity_label: 'Hiking', activity_emoji: '\u{1F97E}', trail_count: 78, business_count: 10, active_posts_count: 20, is_seasonal: true, best_season: 'summer' },

  // Sedona
  { region_name: 'Sedona', city_slug: 'sedona_az', lat: 34.8697, lng: -111.7610, activity_slug: 'mtb', activity_label: 'Mountain Biking', activity_emoji: '\u{1F6B5}', trail_count: 112, business_count: 15, active_posts_count: 30, is_seasonal: true, best_season: 'fall' },
  { region_name: 'Sedona', city_slug: 'sedona_az', lat: 34.8697, lng: -111.7610, activity_slug: 'hiking', activity_label: 'Hiking', activity_emoji: '\u{1F97E}', trail_count: 156, business_count: 12, active_posts_count: 38, is_seasonal: false, best_season: null },
  { region_name: 'Sedona', city_slug: 'sedona_az', lat: 34.8697, lng: -111.7610, activity_slug: 'trail_running', activity_label: 'Trail Running', activity_emoji: '\u{1F3C3}', trail_count: 68, business_count: 4, active_posts_count: 11, is_seasonal: false, best_season: null },

  // Lake Tahoe
  { region_name: 'Lake Tahoe', city_slug: 'lake_tahoe_ca', lat: 39.0968, lng: -120.0324, activity_slug: 'mtb', activity_label: 'Mountain Biking', activity_emoji: '\u{1F6B5}', trail_count: 134, business_count: 16, active_posts_count: 28, is_seasonal: true, best_season: 'summer' },
  { region_name: 'Lake Tahoe', city_slug: 'lake_tahoe_ca', lat: 39.0968, lng: -120.0324, activity_slug: 'hiking', activity_label: 'Hiking', activity_emoji: '\u{1F97E}', trail_count: 178, business_count: 14, active_posts_count: 35, is_seasonal: false, best_season: null },
  { region_name: 'Lake Tahoe', city_slug: 'lake_tahoe_ca', lat: 39.0968, lng: -120.0324, activity_slug: 'skiing', activity_label: 'Skiing', activity_emoji: '\u26F7\uFE0F', trail_count: 95, business_count: 28, active_posts_count: 42, is_seasonal: true, best_season: 'winter' },
  { region_name: 'Lake Tahoe', city_slug: 'lake_tahoe_ca', lat: 39.0968, lng: -120.0324, activity_slug: 'kayaking', activity_label: 'Kayaking / Paddling', activity_emoji: '\u{1F6F6}', trail_count: 15, business_count: 8, active_posts_count: 12, is_seasonal: true, best_season: 'summer' },
];

// ---------------------------------------------------------------------------
// Main Seed Functions
// ---------------------------------------------------------------------------

async function clearExistingData(): Promise<void> {
  console.log('Clearing existing seed data...');

  // Delete in FK order
  const tables = [
    'activity_post_messages',
    'activity_post_participants',
    'activity_posts',
    'reviews',
    'trail_conditions',
    'spotlight_subscriptions',
    'region_highlights',
    'businesses',
    'trails',
    'permits',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().gte('created_at', '1970-01-01');
    if (error && !error.message.includes('0 rows')) {
      console.warn(`  Warning clearing ${table}: ${error.message}`);
    }
  }

  // Delete seed users (special handling)
  const seedUserIds = SEED_USERS.map((u) => u.id);
  const { error: userError } = await supabase
    .from('users')
    .delete()
    .in('id', seedUserIds);
  if (userError) {
    console.warn(`  Warning clearing users: ${userError.message}`);
  }

  console.log('  Done clearing data.');
}

async function seedUsers(): Promise<void> {
  console.log('Seeding users...');

  for (const user of SEED_USERS) {
    // First try to create the auth.users record via admin API
    const { error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: { full_name: user.display_name },
      password: 'SeedPassword123!',
      id: user.id,
    });

    if (authError && !authError.message.includes('already')) {
      // If auth user creation fails (maybe auth.users doesn't allow manual IDs),
      // insert directly into public.users
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          username: user.username,
          activity_preferences: ['mtb', 'hiking', 'trail_running'],
          preferred_skill_level: 'intermediate',
        }, { onConflict: 'id' });

      if (insertError) {
        console.warn(`  Warning seeding user ${user.email}: ${insertError.message}`);
      }
    }
  }

  console.log(`  Seeded ${SEED_USERS.length} users.`);
}

async function seedPermits(): Promise<Map<string, string>> {
  console.log('Seeding permits...');
  const permitMap = new Map<string, string>(); // name -> id

  for (const permit of SEED_PERMITS) {
    const { data, error } = await supabase
      .from('permits')
      .insert({
        name: permit.name,
        type: permit.type,
        fee: permit.fee,
        requires_reservation: permit.requires_reservation,
        reservation_url: permit.reservation_url,
        info_url: permit.info_url,
        country: permit.country,
        country_code: permit.country_code,
        state_province: permit.state_province,
        region: permit.region,
        season_start: permit.season_start,
        season_end: permit.season_end,
      })
      .select('id')
      .single();

    if (error) {
      console.warn(`  Warning seeding permit ${permit.name}: ${error.message}`);
    } else if (data) {
      permitMap.set(permit.name, data.id);

      // Update the geom column using raw SQL via RPC or direct update
      try {
        await supabase.rpc('exec_sql', {
          query: `UPDATE permits SET geom = ST_SetSRID(ST_MakePoint(${permit.lng}, ${permit.lat}), 4326)::geography WHERE id = '${data.id}'`,
        });
      } catch {
        // If exec_sql doesn't exist, geom won't be set
      }
    }
  }

  console.log(`  Seeded ${permitMap.size} permits.`);
  return permitMap;
}

async function seedTrails(permitMap: Map<string, string>): Promise<Map<string, string>> {
  console.log('Seeding trails...');
  const trailMap = new Map<string, string>(); // name -> id

  for (const trail of SEED_TRAILS) {
    const trailSlug = slug(trail.name);
    const permitId = trail.permit_name ? permitMap.get(trail.permit_name) : null;

    const { data, error } = await supabase
      .from('trails')
      .insert({
        name: trail.name,
        slug: trailSlug,
        description: trail.description,
        activity_types: trail.activity_types,
        difficulty: trail.difficulty,
        difficulty_label: trail.difficulty_label,
        technical_rating: trail.technical_rating,
        distance_meters: trail.distance_meters,
        elevation_gain_meters: trail.elevation_gain_meters,
        elevation_loss_meters: trail.elevation_loss_meters,
        max_elevation_meters: trail.max_elevation_meters,
        min_elevation_meters: trail.min_elevation_meters,
        trail_type: trail.trail_type,
        surface_type: trail.surface_type,
        city: trail.city,
        state_province: trail.state_province,
        country: trail.country,
        country_code: trail.country_code,
        current_condition: trail.current_condition,
        condition_updated_at: daysAgo(Math.floor(Math.random() * 5) + 1),
        requires_permit: trail.requires_permit,
        permit_id: permitId,
        rating: trail.rating,
        review_count: trail.review_count,
        ride_count: trail.ride_count,
        best_seasons: trail.best_seasons,
        source: 'community',
        is_active: true,
        created_at: daysAgo(365),
        updated_at: daysAgo(Math.floor(Math.random() * 7) + 1),
      })
      .select('id')
      .single();

    if (error) {
      console.warn(`  Warning seeding trail ${trail.name}: ${error.message}`);
    } else if (data) {
      trailMap.set(trail.name, data.id);

      // Set PostGIS geometry
      try {
        await supabase.rpc('exec_sql', {
          query: `UPDATE trails SET start_point = ST_SetSRID(ST_MakePoint(${trail.lng}, ${trail.lat}), 4326)::geography WHERE id = '${data.id}'`,
        });
      } catch {
        // PostGIS update via RPC not available
      }
    }
  }

  console.log(`  Seeded ${trailMap.size} trails.`);
  return trailMap;
}

async function seedBusinesses(): Promise<Map<string, string>> {
  console.log('Seeding businesses...');
  const businessMap = new Map<string, string>(); // name -> id

  for (const biz of SEED_BUSINESSES) {
    const bizSlug = slug(biz.name);

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: biz.name,
        slug: bizSlug,
        description: biz.description,
        category: biz.category,
        subcategories: biz.subcategories,
        activity_types: biz.activity_types,
        address: biz.address,
        city: biz.city,
        state_province: biz.state_province,
        country: biz.country,
        country_code: biz.country_code,
        postal_code: biz.postal_code,
        phone: biz.phone,
        email: biz.email,
        website_url: biz.website_url,
        hours: biz.hours,
        rating: biz.rating,
        review_count: biz.review_count,
        is_spotlight: biz.is_spotlight,
        spotlight_tier: biz.spotlight_tier,
        spotlight_expires_at: biz.is_spotlight ? daysFromNow(90) : null,
        special_offer: biz.special_offer,
        special_offer_expires_at: biz.special_offer ? daysFromNow(30) : null,
        is_claimed: true,
        tags: biz.tags,
        currency: biz.country_code === 'CA' ? 'CAD' : 'USD',
        source: 'seeder',
        is_active: true,
        created_at: daysAgo(Math.floor(Math.random() * 200) + 100),
        updated_at: daysAgo(Math.floor(Math.random() * 7) + 1),
      })
      .select('id')
      .single();

    if (error) {
      console.warn(`  Warning seeding business ${biz.name}: ${error.message}`);
    } else if (data) {
      businessMap.set(biz.name, data.id);

      // Set PostGIS geometry
      try {
        await supabase.rpc('exec_sql', {
          query: `UPDATE businesses SET geom = ST_SetSRID(ST_MakePoint(${biz.lng}, ${biz.lat}), 4326)::geography WHERE id = '${data.id}'`,
        });
      } catch {
        // PostGIS update via RPC not available
      }
    }
  }

  console.log(`  Seeded ${businessMap.size} businesses.`);
  return businessMap;
}

async function seedReviews(
  trailMap: Map<string, string>,
  businessMap: Map<string, string>,
): Promise<void> {
  console.log('Seeding reviews...');
  let count = 0;

  for (const review of SEED_REVIEWS) {
    let entityId: string | undefined;
    if (review.entity_type === 'trail' && review.trail_name) {
      entityId = trailMap.get(review.trail_name);
    } else if (review.entity_type === 'business' && review.business_name) {
      entityId = businessMap.get(review.business_name);
    }

    if (!entityId) {
      console.warn(`  Skipping review "${review.title}" -- entity not found.`);
      continue;
    }

    const userId = SEED_USERS[review.user_index].id;

    const { error } = await supabase.from('reviews').insert({
      author_id: userId,
      entity_type: review.entity_type,
      entity_id: entityId,
      rating: review.rating,
      title: review.title,
      body: review.body,
      is_verified: true,
      created_at: daysAgo(Math.floor(Math.random() * 30) + 1),
    });

    if (error) {
      console.warn(`  Warning seeding review "${review.title}": ${error.message}`);
    } else {
      count++;
    }
  }

  console.log(`  Seeded ${count} reviews.`);
}

async function seedActivityPosts(trailMap: Map<string, string>): Promise<void> {
  console.log('Seeding activity posts...');
  let count = 0;

  for (const post of SEED_ACTIVITY_POSTS) {
    const trailId = post.trail_name ? trailMap.get(post.trail_name) : null;
    const userId = SEED_USERS[post.user_index].id;

    const { data, error } = await supabase
      .from('activity_posts')
      .insert({
        user_id: userId,
        post_type: post.post_type,
        activity_type: post.activity_type,
        title: post.title,
        description: post.description,
        location_name: post.location_name,
        trail_id: trailId,
        activity_date: daysFromNow(post.activity_date_offset),
        skill_level: post.skill_level,
        max_participants: post.max_participants,
        current_participants: 1,
        permit_required: post.permit_required,
        permit_type: post.permit_type,
        gear_required: post.gear_required,
        contact_method: 'in_app',
        is_public: true,
        status: 'active',
        view_count: Math.floor(Math.random() * 100) + 10,
        created_at: daysAgo(Math.floor(Math.random() * 3) + 1),
      })
      .select('id')
      .single();

    if (error) {
      console.warn(`  Warning seeding post "${post.title}": ${error.message}`);
    } else if (data) {
      count++;

      // Set PostGIS geometry
      try {
        await supabase.rpc('exec_sql', {
          query: `UPDATE activity_posts SET location_point = ST_SetSRID(ST_MakePoint(${post.lng}, ${post.lat}), 4326)::geography WHERE id = '${data.id}'`,
        });
      } catch {
        // PostGIS update via RPC not available
      }
    }
  }

  console.log(`  Seeded ${count} activity posts.`);
}

async function seedRegionHighlights(): Promise<void> {
  console.log('Seeding region highlights...');
  let count = 0;

  for (const rh of SEED_REGION_HIGHLIGHTS) {
    const { data, error } = await supabase
      .from('region_highlights')
      .insert({
        region_name: rh.region_name,
        city_slug: rh.city_slug,
        activity_slug: rh.activity_slug,
        activity_label: rh.activity_label,
        activity_emoji: rh.activity_emoji,
        trail_count: rh.trail_count,
        business_count: rh.business_count,
        active_posts_count: rh.active_posts_count,
        is_seasonal: rh.is_seasonal,
        best_season: rh.best_season,
      })
      .select('id')
      .single();

    if (error) {
      console.warn(`  Warning seeding region highlight ${rh.region_name}/${rh.activity_slug}: ${error.message}`);
    } else if (data) {
      count++;

      // Set PostGIS geometry
      try {
        await supabase.rpc('exec_sql', {
          query: `UPDATE region_highlights SET center_point = ST_SetSRID(ST_MakePoint(${rh.lng}, ${rh.lat}), 4326)::geography WHERE id = '${data.id}'`,
        });
      } catch {
        // PostGIS update via RPC not available
      }
    }
  }

  console.log(`  Seeded ${count} region highlights.`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== CairnConnect Database Seed ===\n');
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);

  try {
    await clearExistingData();
    await seedUsers();
    const permitMap = await seedPermits();
    const trailMap = await seedTrails(permitMap);
    const businessMap = await seedBusinesses();
    await seedReviews(trailMap, businessMap);
    await seedActivityPosts(trailMap);
    await seedRegionHighlights();

    console.log('\n=== Seed complete! ===');
    console.log(`  Trails:            ${trailMap.size}`);
    console.log(`  Businesses:        ${businessMap.size}`);
    console.log(`  Permits:           ${permitMap.size}`);
    console.log(`  Reviews:           ${SEED_REVIEWS.length}`);
    console.log(`  Activity Posts:    ${SEED_ACTIVITY_POSTS.length}`);
    console.log(`  Region Highlights: ${SEED_REGION_HIGHLIGHTS.length}`);
    console.log(`  Users:             ${SEED_USERS.length}`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

main();
