export interface AnchorCity {
  slug: string;
  name: string;
  state_province: string;
  country: string;
  country_code: string;
  lat: number;
  lng: number;
  radius_km: number;
  tier: 1 | 2 | 3;
  timezone: string;
}

export const ANCHOR_CITIES: AnchorCity[] = [
  // Tier 1 — US West
  { slug: 'moab_ut', name: 'Moab', state_province: 'Utah', country: 'United States', country_code: 'US', lat: 38.5733, lng: -109.5498, radius_km: 60, tier: 1, timezone: 'America/Denver' },
  { slug: 'bend_or', name: 'Bend', state_province: 'Oregon', country: 'United States', country_code: 'US', lat: 44.0582, lng: -121.3153, radius_km: 50, tier: 1, timezone: 'America/Los_Angeles' },
  { slug: 'boulder_co', name: 'Boulder', state_province: 'Colorado', country: 'United States', country_code: 'US', lat: 40.0150, lng: -105.2705, radius_km: 50, tier: 1, timezone: 'America/Denver' },
  { slug: 'sedona_az', name: 'Sedona', state_province: 'Arizona', country: 'United States', country_code: 'US', lat: 34.8697, lng: -111.7610, radius_km: 40, tier: 1, timezone: 'America/Phoenix' },
  { slug: 'lake_tahoe_ca', name: 'Lake Tahoe', state_province: 'California', country: 'United States', country_code: 'US', lat: 39.0968, lng: -120.0324, radius_km: 50, tier: 1, timezone: 'America/Los_Angeles' },
  { slug: 'park_city_ut', name: 'Park City', state_province: 'Utah', country: 'United States', country_code: 'US', lat: 40.6461, lng: -111.4980, radius_km: 40, tier: 1, timezone: 'America/Denver' },
  { slug: 'jackson_wy', name: 'Jackson Hole', state_province: 'Wyoming', country: 'United States', country_code: 'US', lat: 43.4799, lng: -110.7624, radius_km: 50, tier: 1, timezone: 'America/Denver' },
  // Tier 1 — US East/South
  { slug: 'asheville_nc', name: 'Asheville', state_province: 'North Carolina', country: 'United States', country_code: 'US', lat: 35.5951, lng: -82.5515, radius_km: 50, tier: 1, timezone: 'America/New_York' },
  { slug: 'chattanooga_tn', name: 'Chattanooga', state_province: 'Tennessee', country: 'United States', country_code: 'US', lat: 35.0456, lng: -85.3097, radius_km: 50, tier: 1, timezone: 'America/New_York' },
  // Tier 1 — Pacific Northwest
  { slug: 'bellingham_wa', name: 'Bellingham', state_province: 'Washington', country: 'United States', country_code: 'US', lat: 48.7519, lng: -122.4787, radius_km: 50, tier: 1, timezone: 'America/Los_Angeles' },
  // Tier 1 — International
  { slug: 'whistler_bc', name: 'Whistler', state_province: 'British Columbia', country: 'Canada', country_code: 'CA', lat: 50.1163, lng: -122.9574, radius_km: 40, tier: 1, timezone: 'America/Vancouver' },
  { slug: 'queenstown_nz', name: 'Queenstown', state_province: 'Otago', country: 'New Zealand', country_code: 'NZ', lat: -45.0312, lng: 168.6626, radius_km: 50, tier: 1, timezone: 'Pacific/Auckland' },
  { slug: 'chamonix_fr', name: 'Chamonix', state_province: 'Haute-Savoie', country: 'France', country_code: 'FR', lat: 45.9237, lng: 6.8694, radius_km: 30, tier: 1, timezone: 'Europe/Paris' },
];
