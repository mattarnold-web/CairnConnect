export interface ActivityType {
  slug: string;
  label: string;
  emoji: string;
  category: 'mountain' | 'water' | 'snow' | 'air' | 'nature';
  seasons: string[];
  sortOrder: number;
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { slug: 'mtb', label: 'Mountain Biking', emoji: '🚵', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 1 },
  { slug: 'hiking', label: 'Hiking', emoji: '🥾', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 2 },
  { slug: 'trail_running', label: 'Trail Running', emoji: '🏃', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 3 },
  { slug: 'climbing', label: 'Rock Climbing', emoji: '🧗', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 4 },
  { slug: 'road_cycling', label: 'Road Cycling', emoji: '🚴', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 5 },
  { slug: 'camping', label: 'Camping', emoji: '🏕️', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 6 },
  { slug: 'horseback', label: 'Horseback Riding', emoji: '🏇', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 7 },
  { slug: 'disc_golf', label: 'Disc Golf', emoji: '🥏', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 8 },
  { slug: 'orienteering', label: 'Orienteering', emoji: '🧭', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 9 },
  { slug: 'fly_fishing', label: 'Fly Fishing', emoji: '🎣', category: 'mountain', seasons: ['spring','summer','fall'], sortOrder: 10 },
  { slug: 'kayaking', label: 'Kayaking / Paddling', emoji: '🛶', category: 'water', seasons: ['spring','summer','fall'], sortOrder: 11 },
  { slug: 'surfing', label: 'Surfing', emoji: '🏄', category: 'water', seasons: ['all'], sortOrder: 12 },
  { slug: 'scuba', label: 'Scuba / Snorkeling', emoji: '🤿', category: 'water', seasons: ['summer','fall'], sortOrder: 13 },
  { slug: 'kitesurfing', label: 'Kite Surfing', emoji: '🪁', category: 'water', seasons: ['spring','summer','fall'], sortOrder: 14 },
  { slug: 'wild_swimming', label: 'Wild Swimming', emoji: '🏊', category: 'water', seasons: ['summer'], sortOrder: 15 },
  { slug: 'motorized_water', label: 'Motorized Water Sports', emoji: '🚤', category: 'water', seasons: ['summer'], sortOrder: 16 },
  { slug: 'standup_paddle', label: 'Stand-Up Paddleboard', emoji: '🏄', category: 'water', seasons: ['spring','summer','fall'], sortOrder: 17 },
  { slug: 'whitewater', label: 'Whitewater Rafting', emoji: '🌊', category: 'water', seasons: ['spring','summer'], sortOrder: 18 },
  { slug: 'skiing', label: 'Skiing', emoji: '⛷️', category: 'snow', seasons: ['winter'], sortOrder: 19 },
  { slug: 'snowboarding', label: 'Snowboarding', emoji: '🏂', category: 'snow', seasons: ['winter'], sortOrder: 20 },
  { slug: 'nordic_skiing', label: 'Nordic Skiing', emoji: '🎿', category: 'snow', seasons: ['winter'], sortOrder: 21 },
  { slug: 'snowshoeing', label: 'Snowshoeing', emoji: '🥾', category: 'snow', seasons: ['winter'], sortOrder: 22 },
  { slug: 'ice_climbing', label: 'Ice Climbing', emoji: '🧊', category: 'snow', seasons: ['winter'], sortOrder: 23 },
  { slug: 'paragliding', label: 'Paragliding', emoji: '🪂', category: 'air', seasons: ['spring','summer','fall'], sortOrder: 24 },
  { slug: 'drone_flying', label: 'Drone Flying', emoji: '🛸', category: 'air', seasons: ['all'], sortOrder: 25 },
  { slug: 'wildlife_photography', label: 'Wildlife Photography', emoji: '📸', category: 'nature', seasons: ['all'], sortOrder: 26 },
  { slug: 'birdwatching', label: 'Birdwatching', emoji: '🦅', category: 'nature', seasons: ['all'], sortOrder: 27 },
  { slug: 'outdoor_yoga', label: 'Outdoor Yoga', emoji: '🧘', category: 'nature', seasons: ['spring','summer','fall'], sortOrder: 28 },
  { slug: 'foraging', label: 'Foraging', emoji: '🍄', category: 'nature', seasons: ['spring','summer','fall'], sortOrder: 29 },
];

export const ACTIVITY_TYPE_MAP = Object.fromEntries(
  ACTIVITY_TYPES.map(a => [a.slug, a])
);

export const ACTIVITY_CATEGORIES = [
  { slug: 'mountain', label: 'Mountain & Land', emoji: '⛰️' },
  { slug: 'water', label: 'Water', emoji: '🌊' },
  { slug: 'snow', label: 'Snow & Ice', emoji: '❄️' },
  { slug: 'air', label: 'Air', emoji: '🌤️' },
  { slug: 'nature', label: 'Nature & Wellness', emoji: '🌿' },
] as const;
