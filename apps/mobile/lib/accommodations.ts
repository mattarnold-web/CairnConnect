/**
 * Accommodation Booking Integration
 *
 * Generates booking search URLs for major accommodation platforms,
 * pre-filled with location and optional dates.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccommodationLink {
  platform: 'booking' | 'airbnb' | 'vrbo' | 'hostelworld' | 'hotels';
  name: string;
  icon: string;
  url: string;
  color: string;
}

export interface AccommodationOptions {
  locationName: string;
  lat: number;
  lng: number;
  checkin?: string; // YYYY-MM-DD
  checkout?: string; // YYYY-MM-DD
  guests?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a query string from key-value pairs, omitting undefined values. */
function buildQueryString(
  pairs: Array<[string, string | undefined]>,
): string {
  return pairs
    .filter((p): p is [string, string] => p[1] != null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

// ---------------------------------------------------------------------------
// URL builders
// ---------------------------------------------------------------------------

function buildBookingUrl(opts: AccommodationOptions): string {
  const qs = buildQueryString([
    ['ss', opts.locationName],
    ['checkin', opts.checkin],
    ['checkout', opts.checkout],
    ['group_adults', opts.guests ? String(opts.guests) : undefined],
  ]);
  return `https://www.booking.com/searchresults.html?${qs}`;
}

function buildAirbnbUrl(opts: AccommodationOptions): string {
  const base = `https://www.airbnb.com/s/${encodeURIComponent(opts.locationName)}/homes`;
  const qs = buildQueryString([
    ['checkin', opts.checkin],
    ['checkout', opts.checkout],
    ['adults', opts.guests ? String(opts.guests) : undefined],
  ]);
  return qs ? `${base}?${qs}` : base;
}

function buildVrboUrl(opts: AccommodationOptions): string {
  const qs = buildQueryString([
    ['destination', opts.locationName],
    ['startDate', opts.checkin],
    ['endDate', opts.checkout],
    ['adults', opts.guests ? String(opts.guests) : undefined],
  ]);
  return `https://www.vrbo.com/search?${qs}`;
}

function buildHostelworldUrl(opts: AccommodationOptions): string {
  const qs = buildQueryString([
    ['q', opts.locationName],
    ['dateFrom', opts.checkin],
    ['dateTo', opts.checkout],
    ['guests', opts.guests ? String(opts.guests) : undefined],
  ]);
  return `https://www.hostelworld.com/s?${qs}`;
}

function buildHotelsUrl(opts: AccommodationOptions): string {
  const qs = buildQueryString([
    ['q-destination', opts.locationName],
    ['q-check-in', opts.checkin],
    ['q-check-out', opts.checkout],
    ['q-rooms', '1'],
    ['q-room-0-adults', opts.guests ? String(opts.guests) : undefined],
  ]);
  return `https://www.hotels.com/search.do?${qs}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate booking URLs with location and optional dates pre-filled.
 */
export function getAccommodationLinks(
  options: AccommodationOptions,
): AccommodationLink[] {
  return [
    {
      platform: 'booking',
      name: 'Booking.com',
      icon: '\uD83C\uDFE8', // hotel emoji
      url: buildBookingUrl(options),
      color: '#003580',
    },
    {
      platform: 'airbnb',
      name: 'Airbnb',
      icon: '\uD83C\uDFE0', // house emoji
      url: buildAirbnbUrl(options),
      color: '#FF5A5F',
    },
    {
      platform: 'vrbo',
      name: 'VRBO',
      icon: '\uD83C\uDFE1', // house with garden emoji
      url: buildVrboUrl(options),
      color: '#3D67FF',
    },
    {
      platform: 'hostelworld',
      name: 'Hostelworld',
      icon: '\uD83D\uDECC', // bed emoji
      url: buildHostelworldUrl(options),
      color: '#F47521',
    },
    {
      platform: 'hotels',
      name: 'Hotels.com',
      icon: '\uD83D\uDECE\uFE0F', // bellhop bell emoji
      url: buildHotelsUrl(options),
      color: '#D32F2F',
    },
  ];
}
