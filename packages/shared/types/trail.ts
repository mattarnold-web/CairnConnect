export interface Trail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  activity_types: string[];
  difficulty: TrailDifficulty;
  difficulty_label: string | null;
  technical_rating: number | null;
  distance_meters: number;
  elevation_gain_meters: number;
  elevation_loss_meters: number;
  max_elevation_meters: number | null;
  min_elevation_meters: number | null;
  trail_type: 'loop' | 'out_and_back' | 'point_to_point' | 'network';
  surface_type: string[];
  lat: number;
  lng: number;
  route_geojson: Record<string, unknown> | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
  country_code: string | null;
  current_condition: 'open' | 'caution' | 'closed' | 'unknown';
  condition_updated_at: string | null;
  requires_permit: boolean;
  permit_id: string | null;
  rating: number;
  review_count: number;
  ride_count: number;
  photos: string[];
  cover_photo_url: string | null;
  best_seasons: string[];
  source: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TrailDifficulty = 'green' | 'blue' | 'black' | 'double_black' | 'proline';

export const DIFFICULTY_LABELS: Record<TrailDifficulty, string> = {
  green: 'Beginner',
  blue: 'Intermediate',
  black: 'Advanced',
  double_black: 'Expert',
  proline: 'Pro Line',
};

export const DIFFICULTY_COLORS: Record<TrailDifficulty, string> = {
  green: '#10B981',
  blue: '#3B82F6',
  black: '#1F2937',
  double_black: '#111827',
  proline: '#7C3AED',
};

export const CONDITION_LABELS: Record<string, string> = {
  open: 'Open',
  caution: 'Caution',
  closed: 'Closed',
  unknown: 'Unknown',
};

export const CONDITION_COLORS: Record<string, string> = {
  open: '#10B981',
  caution: '#F59E0B',
  closed: '#EF4444',
  unknown: '#6B7280',
};
