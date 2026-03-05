/**
 * Region Discovery Service
 *
 * When a user searches for a new region that has no data in the database,
 * this service discovers and caches new points of interest.
 */

import { supabase } from './supabase';
import type { Business } from '@cairn/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiscoveryResult {
  region: string;
  trailsFound: number;
  businessesFound: number;
  cached: boolean;
}

export interface RegionCoverage {
  trailCount: number;
  businessCount: number;
  hasSufficientData: boolean;
}

export interface Region {
  name: string;
  country: string;
  lat: number;
  lng: number;
  radiusKm: number;
  description: string;
  topActivities: string[];
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Untyped Supabase client for RPC / edge function calls
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum number of trails + businesses to consider a region "covered" */
const SUFFICIENT_DATA_THRESHOLD = 5;

/** Default discovery radius when none is provided */
const DEFAULT_RADIUS_KM = 25;

/** Google Places API key (optional -- set via EXPO_PUBLIC_GOOGLE_PLACES_KEY) */
const GOOGLE_PLACES_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? '';

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Check if a region has data within the given radius.
 */
export async function checkRegionCoverage(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<RegionCoverage> {
  try {
    const radiusMeters = radiusKm * 1000;

    const [trailsRes, businessesRes] = await Promise.all([
      sb.rpc('count_trails_near_point', {
        p_lat: lat,
        p_lng: lng,
        p_radius_m: radiusMeters,
      }),
      sb.rpc('count_businesses_near_point', {
        p_lat: lat,
        p_lng: lng,
        p_radius_m: radiusMeters,
      }),
    ]);

    const trailCount =
      typeof trailsRes.data === 'number'
        ? trailsRes.data
        : (trailsRes.data as { count: number })?.count ?? 0;

    const businessCount =
      typeof businessesRes.data === 'number'
        ? businessesRes.data
        : (businessesRes.data as { count: number })?.count ?? 0;

    return {
      trailCount,
      businessCount,
      hasSufficientData:
        trailCount + businessCount >= SUFFICIENT_DATA_THRESHOLD,
    };
  } catch {
    // If the RPCs do not exist yet, fall back to a simple select + count
    try {
      const { count: trailCount } = await sb
        .from('trails')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: businessCount } = await sb
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        trailCount: trailCount ?? 0,
        businessCount: businessCount ?? 0,
        hasSufficientData:
          (trailCount ?? 0) + (businessCount ?? 0) >= SUFFICIENT_DATA_THRESHOLD,
      };
    } catch {
      return { trailCount: 0, businessCount: 0, hasSufficientData: false };
    }
  }
}

/**
 * Discover businesses near a point using Google Places API (if key available).
 * Falls back to a Supabase edge function or returns an empty array.
 */
export async function discoverBusinessesNearby(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<Business[]> {
  // Attempt Google Places Nearby Search
  if (GOOGLE_PLACES_KEY) {
    try {
      const radiusMeters = Math.min(radiusKm * 1000, 50000);
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${lat},${lng}` +
        `&radius=${radiusMeters}` +
        `&type=store` +
        `&keyword=outdoor+gear+bike+shop+guide` +
        `&key=${GOOGLE_PLACES_KEY}`;

      const res = await fetch(url);
      const json = (await res.json()) as {
        results?: Array<{
          place_id: string;
          name: string;
          geometry: { location: { lat: number; lng: number } };
          vicinity?: string;
          rating?: number;
          user_ratings_total?: number;
          types?: string[];
        }>;
      };

      if (json.results && json.results.length > 0) {
        return json.results.map((place) => placeToBusiness(place, lat, lng));
      }
    } catch {
      // Fall through to edge function fallback
    }
  }

  // Attempt Supabase edge function fallback
  try {
    const { data, error } = await sb.functions.invoke('discover-businesses', {
      body: { lat, lng, radiusKm },
    });

    if (!error && Array.isArray(data)) {
      return data as Business[];
    }
  } catch {
    // no-op
  }

  return [];
}

/**
 * Convert a Google Places result to our Business type.
 */
function placeToBusiness(
  place: {
    place_id: string;
    name: string;
    geometry: { location: { lat: number; lng: number } };
    vicinity?: string;
    rating?: number;
    user_ratings_total?: number;
    types?: string[];
  },
  _regionLat: number,
  _regionLng: number,
): Business {
  const slug = place.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: `gp-${place.place_id}`,
    name: place.name,
    slug,
    description: null,
    category: 'outdoor_gear_shop',
    subcategories: [],
    activity_types: [],
    address: place.vicinity ?? null,
    city: null,
    state_province: null,
    country: null,
    country_code: null,
    postal_code: null,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    phone: null,
    email: null,
    website_url: null,
    booking_url: null,
    instagram_handle: null,
    facebook_url: null,
    tripadvisor_url: null,
    yelp_url: null,
    alltrails_url: null,
    google_maps_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    youtube_url: null,
    strava_segment_url: null,
    hours: {},
    photos: [],
    cover_photo_url: null,
    rating: place.rating ?? 0,
    review_count: place.user_ratings_total ?? 0,
    is_spotlight: false,
    spotlight_tier: null,
    special_offer: null,
    special_offer_expires_at: null,
    is_claimed: false,
    claimed_by: null,
    tags: place.types?.slice(0, 5) ?? [],
    currency: 'USD',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Save discovered data to Supabase for future queries.
 */
export async function cacheDiscoveredData(
  businesses: Business[],
): Promise<void> {
  if (businesses.length === 0) return;

  try {
    const rows = businesses.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      category: b.category,
      subcategories: b.subcategories,
      activity_types: b.activity_types,
      address: b.address,
      city: b.city,
      state_province: b.state_province,
      country: b.country,
      lat: b.lat,
      lng: b.lng,
      rating: b.rating,
      review_count: b.review_count,
      google_maps_url: b.google_maps_url,
      tags: b.tags,
      is_active: true,
    }));

    await sb.from('businesses').upsert(rows, { onConflict: 'slug' });
  } catch {
    // Caching is best-effort; don't fail the user flow
  }
}

/**
 * Main entry point -- check a region, discover if needed, return data.
 */
export async function exploreRegion(
  regionName: string,
  lat: number,
  lng: number,
  radiusKm: number = DEFAULT_RADIUS_KM,
): Promise<DiscoveryResult> {
  // 1. Check existing coverage
  const coverage = await checkRegionCoverage(lat, lng, radiusKm);

  if (coverage.hasSufficientData) {
    return {
      region: regionName,
      trailsFound: coverage.trailCount,
      businessesFound: coverage.businessCount,
      cached: true,
    };
  }

  // 2. Discover new businesses
  const discovered = await discoverBusinessesNearby(lat, lng, radiusKm);

  // 3. Cache for future use
  if (discovered.length > 0) {
    await cacheDiscoveredData(discovered);
  }

  return {
    region: regionName,
    trailsFound: coverage.trailCount,
    businessesFound: coverage.businessCount + discovered.length,
    cached: false,
  };
}

// ---------------------------------------------------------------------------
// Popular Regions
// ---------------------------------------------------------------------------

const POPULAR_REGIONS: Region[] = [
  // Utah
  {
    name: 'Moab',
    country: 'United States',
    lat: 38.5733,
    lng: -109.5498,
    radiusKm: 30,
    description: 'Red rock paradise for mountain biking, hiking, and canyoneering near Arches & Canyonlands',
    topActivities: ['mtb', 'hiking', 'climbing', 'camping'],
  },
  {
    name: 'Park City',
    country: 'United States',
    lat: 40.6461,
    lng: -111.498,
    radiusKm: 20,
    description: 'World-class mountain biking and skiing in the Wasatch Range',
    topActivities: ['mtb', 'skiing', 'trail_running', 'road_cycling'],
  },
  {
    name: 'St. George',
    country: 'United States',
    lat: 37.0965,
    lng: -113.5684,
    radiusKm: 25,
    description: 'Desert singletrack and red rock hiking in southern Utah',
    topActivities: ['mtb', 'hiking', 'climbing', 'road_cycling'],
  },
  {
    name: 'Zion',
    country: 'United States',
    lat: 37.2982,
    lng: -113.0263,
    radiusKm: 20,
    description: 'Iconic canyon hikes, canyoneering, and stunning slot canyons',
    topActivities: ['hiking', 'climbing', 'camping', 'trail_running'],
  },
  {
    name: 'Bryce Canyon',
    country: 'United States',
    lat: 37.5930,
    lng: -112.1871,
    radiusKm: 15,
    description: 'Surreal hoodoo landscapes with epic hiking and trail running',
    topActivities: ['hiking', 'camping', 'trail_running', 'horseback'],
  },
  {
    name: 'Salt Lake City',
    country: 'United States',
    lat: 40.7608,
    lng: -111.891,
    radiusKm: 30,
    description: 'Gateway to the Wasatch with year-round skiing, biking, and climbing',
    topActivities: ['skiing', 'snowboarding', 'mtb', 'climbing', 'hiking'],
  },

  // Western US
  {
    name: 'Bend',
    country: 'United States',
    lat: 44.0582,
    lng: -121.3153,
    radiusKm: 30,
    description: 'Pacific Northwest hub for trail running, mountain biking, and skiing',
    topActivities: ['mtb', 'trail_running', 'skiing', 'kayaking'],
  },
  {
    name: 'Sedona',
    country: 'United States',
    lat: 34.8697,
    lng: -111.761,
    radiusKm: 20,
    description: 'Red rock trails, world-class mountain biking, and desert beauty',
    topActivities: ['mtb', 'hiking', 'climbing', 'trail_running'],
  },
  {
    name: 'Lake Tahoe',
    country: 'United States',
    lat: 39.0968,
    lng: -120.0324,
    radiusKm: 30,
    description: 'Alpine playground for skiing, mountain biking, and water sports',
    topActivities: ['skiing', 'mtb', 'kayaking', 'hiking', 'snowboarding'],
  },
  {
    name: 'Durango',
    country: 'United States',
    lat: 37.2753,
    lng: -107.8801,
    radiusKm: 25,
    description: 'Colorado mountain town with legendary singletrack and river sports',
    topActivities: ['mtb', 'skiing', 'kayaking', 'hiking', 'trail_running'],
  },
  {
    name: 'Fruita',
    country: 'United States',
    lat: 39.1588,
    lng: -108.7289,
    radiusKm: 15,
    description: 'Desert mountain biking mecca with miles of world-class singletrack',
    topActivities: ['mtb', 'hiking', 'camping', 'road_cycling'],
  },
  {
    name: 'Bentonville',
    country: 'United States',
    lat: 36.3729,
    lng: -94.2088,
    radiusKm: 20,
    description: 'Purpose-built mountain bike trails and growing outdoor culture in the Ozarks',
    topActivities: ['mtb', 'trail_running', 'hiking', 'road_cycling'],
  },

  // Eastern US
  {
    name: 'Pisgah',
    country: 'United States',
    lat: 35.2913,
    lng: -82.7317,
    radiusKm: 25,
    description: 'Old-growth forest with rugged mountain biking, hiking, and waterfalls',
    topActivities: ['mtb', 'hiking', 'trail_running', 'fly_fishing'],
  },

  // Canada
  {
    name: 'Whistler',
    country: 'Canada',
    lat: 50.1163,
    lng: -122.9574,
    radiusKm: 20,
    description: 'Legendary bike park, world-class skiing, and alpine adventures',
    topActivities: ['mtb', 'skiing', 'snowboarding', 'hiking', 'trail_running'],
  },
  {
    name: 'Squamish',
    country: 'Canada',
    lat: 49.7016,
    lng: -123.1558,
    radiusKm: 15,
    description: 'Sea-to-sky climbing, mountain biking, and kite surfing paradise',
    topActivities: ['climbing', 'mtb', 'kitesurfing', 'hiking', 'trail_running'],
  },

  // Europe
  {
    name: 'Finale Ligure',
    country: 'Italy',
    lat: 44.1693,
    lng: 8.3419,
    radiusKm: 15,
    description: 'Mediterranean mountain biking with coastal trails and Italian culture',
    topActivities: ['mtb', 'climbing', 'hiking', 'trail_running'],
  },
  {
    name: 'Chamonix',
    country: 'France',
    lat: 45.9237,
    lng: 6.8694,
    radiusKm: 20,
    description: 'Alpine mountaineering capital with skiing, trail running, and paragliding',
    topActivities: ['skiing', 'climbing', 'trail_running', 'paragliding', 'hiking'],
  },

  // New Zealand & Australia
  {
    name: 'Queenstown',
    country: 'New Zealand',
    lat: -45.0312,
    lng: 168.6626,
    radiusKm: 25,
    description: 'Adventure capital with bungee, mountain biking, skiing, and jet boats',
    topActivities: ['mtb', 'skiing', 'kayaking', 'hiking', 'paragliding'],
  },
  {
    name: 'Rotorua',
    country: 'New Zealand',
    lat: -38.1368,
    lng: 176.2497,
    radiusKm: 15,
    description: 'Mountain biking and geothermal adventure in the North Island',
    topActivities: ['mtb', 'hiking', 'kayaking', 'trail_running'],
  },
  {
    name: 'Derby',
    country: 'Australia',
    lat: -41.1526,
    lng: 147.8075,
    radiusKm: 20,
    description: 'Blue Derby mountain bike trails in the Tasmanian wilderness',
    topActivities: ['mtb', 'hiking', 'trail_running', 'kayaking'],
  },
];

/**
 * Get popular regions for quick access.
 */
export function getPopularRegions(): Region[] {
  return POPULAR_REGIONS;
}
