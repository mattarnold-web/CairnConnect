export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: BusinessCategory;
  subcategories: string[];
  activity_types: string[];
  address: string | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
  country_code: string | null;
  postal_code: string | null;
  lat: number;
  lng: number;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  booking_url: string | null;
  instagram_handle: string | null;
  facebook_url: string | null;
  tripadvisor_url: string | null;
  yelp_url: string | null;
  alltrails_url: string | null;
  google_maps_url: string | null;
  youtube_url: string | null;
  strava_segment_url: string | null;
  hours: Record<string, string>;
  photos: string[];
  cover_photo_url: string | null;
  rating: number;
  review_count: number;
  is_spotlight: boolean;
  spotlight_tier: 'founding' | 'standard' | 'premium' | null;
  special_offer: string | null;
  special_offer_expires_at: string | null;
  is_claimed: boolean;
  claimed_by: string | null;
  tags: string[];
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BusinessCategory =
  | 'bike_shop' | 'gear_rental' | 'guide_service' | 'outfitter'
  | 'outdoor_gear_shop' | 'bike_shuttle' | 'levada_guide'
  | 'mountain_hut' | 'via_ferrata' | 'canyoning' | 'paragliding'
  | 'kayak_sup' | 'surf_school' | 'diving'
  | 'adventure_hostel' | 'camping' | 'trailhead_cafe'
  | 'permit_office' | 'outdoor_club';

export const BUSINESS_CATEGORY_LABELS: Record<BusinessCategory, string> = {
  bike_shop: 'Bike Shop',
  gear_rental: 'Gear Rental',
  guide_service: 'Guide Service',
  outfitter: 'Outfitter',
  outdoor_gear_shop: 'Outdoor Gear Shop',
  bike_shuttle: 'Bike Shuttle',
  levada_guide: 'Levada Guide',
  mountain_hut: 'Mountain Hut',
  via_ferrata: 'Via Ferrata',
  canyoning: 'Canyoning',
  paragliding: 'Paragliding',
  kayak_sup: 'Kayak & SUP',
  surf_school: 'Surf School',
  diving: 'Diving',
  adventure_hostel: 'Adventure Hostel',
  camping: 'Camping',
  trailhead_cafe: 'Trailhead Cafe',
  permit_office: 'Permit Office',
  outdoor_club: 'Outdoor Club',
};

export const BUSINESS_CATEGORY_ICONS: Record<BusinessCategory, string> = {
  bike_shop: '🚲',
  gear_rental: '🎒',
  guide_service: '🧭',
  outfitter: '🏕️',
  outdoor_gear_shop: '🛒',
  bike_shuttle: '🚐',
  levada_guide: '🥾',
  mountain_hut: '🏔️',
  via_ferrata: '⛰️',
  canyoning: '🏞️',
  paragliding: '🪂',
  kayak_sup: '🛶',
  surf_school: '🏄',
  diving: '🤿',
  adventure_hostel: '🏠',
  camping: '⛺',
  trailhead_cafe: '☕',
  permit_office: '📋',
  outdoor_club: '🤝',
};
