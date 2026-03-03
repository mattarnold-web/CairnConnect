import type { RecordedActivity, GpsPoint } from './activity-types';
import type { TripState, TripDay } from './trip-types';

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();
const daysFromNow = (d: number) => new Date(now + d * 86400000).toISOString();

function makeTrack(points: [number, number, number][]): GpsPoint[] {
  const baseTime = now - 3 * 86400000;
  return points.map((p, i) => ({
    lat: p[0],
    lng: p[1],
    altitude: p[2],
    timestamp: baseTime + i * 60000,
    accuracy: 4,
  }));
}

export const DEMO_ACTIVITIES: RecordedActivity[] = [
  {
    id: 'demo-act-1',
    title: 'Delicate Arch Trail',
    activityType: 'hiking',
    status: 'completed',
    startedAt: daysAgo(2),
    endedAt: daysAgo(2),
    gpsTrack: makeTrack([
      [38.7436, -109.4993, 1524],
      [38.7428, -109.4985, 1540],
      [38.7419, -109.4972, 1563],
      [38.7411, -109.4961, 1580],
      [38.7397, -109.4953, 1596],
      [38.7385, -109.4941, 1570],
    ]),
    distanceMeters: 4828,
    durationSeconds: 5400,
    elevationGainMeters: 146,
    elevationLossMeters: 146,
    maxElevationMeters: 1596,
    minElevationMeters: 1524,
    photos: [],
    notes: 'Amazing views at the top! Got there early to beat the crowds.',
  },
  {
    id: 'demo-act-2',
    title: 'Slickrock Bike Trail',
    activityType: 'mtb',
    status: 'completed',
    startedAt: daysAgo(1),
    endedAt: daysAgo(1),
    gpsTrack: makeTrack([
      [38.5956, -109.5382, 1432],
      [38.5944, -109.5371, 1445],
      [38.5938, -109.5355, 1460],
      [38.5930, -109.5340, 1448],
      [38.5921, -109.5328, 1470],
      [38.5913, -109.5312, 1455],
      [38.5920, -109.5298, 1440],
      [38.5932, -109.5310, 1435],
    ]),
    distanceMeters: 16900,
    durationSeconds: 10800,
    elevationGainMeters: 396,
    elevationLossMeters: 396,
    maxElevationMeters: 1470,
    minElevationMeters: 1432,
    photos: [],
    notes: 'What a ride! Petrified sand dunes are incredible. Bring extra water.',
  },
  {
    id: 'demo-act-3',
    title: 'Corona Arch Hike',
    activityType: 'hiking',
    status: 'completed',
    startedAt: daysAgo(0),
    endedAt: daysAgo(0),
    gpsTrack: makeTrack([
      [38.5802, -109.6210, 1280],
      [38.5790, -109.6195, 1295],
      [38.5778, -109.6180, 1310],
      [38.5770, -109.6168, 1325],
      [38.5762, -109.6155, 1340],
    ]),
    distanceMeters: 4800,
    durationSeconds: 4200,
    elevationGainMeters: 137,
    elevationLossMeters: 77,
    maxElevationMeters: 1340,
    minElevationMeters: 1280,
    photos: [],
    notes: 'Corona Arch is massive! The ladder and cable section adds some fun scrambling.',
  },
];

export const DEMO_TRIP: TripState = {
  id: 'demo-trip-1',
  shareCode: 'MOAB2024',
  currentStep: 'summary',
  region: {
    slug: 'moab_ut',
    name: 'Moab',
    state_province: 'Utah',
    country: 'United States',
    continent: 'North America',
    description: 'Red rock paradise for mountain biking, hiking, and canyoneering',
    coverEmoji: '\u{1F3DC}\u{FE0F}',
    trailCount: 10,
    businessCount: 12,
    hasData: true,
  },
  selectedActivities: ['mtb', 'hiking', 'climbing'],
  startDate: daysFromNow(7),
  tripName: 'Moab Adventure Weekend',
  days: [
    {
      id: 'demo-day-1',
      dayNumber: 1,
      date: daysFromNow(7),
      label: 'Arrival & Warm-up',
      items: [
        {
          id: 'demo-item-1',
          type: 'trail',
          trailId: 't005',
          customTitle: null,
          customActivityType: null,
          notes: 'Easy warm-up hike to start the trip',
          timeSlot: 'afternoon',
        },
        {
          id: 'demo-item-2',
          type: 'custom',
          trailId: null,
          customTitle: 'Dinner in town',
          customActivityType: 'camping',
          notes: 'Check out local restaurants near Main St',
          timeSlot: 'evening',
        },
      ],
    },
    {
      id: 'demo-day-2',
      dayNumber: 2,
      date: daysFromNow(8),
      label: 'Big Ride Day',
      items: [
        {
          id: 'demo-item-3',
          type: 'trail',
          trailId: 't001',
          customTitle: null,
          customActivityType: null,
          notes: 'Slickrock! Bring 3L water minimum',
          timeSlot: 'morning',
        },
        {
          id: 'demo-item-4',
          type: 'trail',
          trailId: 't004',
          customTitle: null,
          customActivityType: null,
          notes: 'Afternoon cooldown ride',
          timeSlot: 'afternoon',
        },
      ],
    },
    {
      id: 'demo-day-3',
      dayNumber: 3,
      date: daysFromNow(9),
      label: 'Hike & Depart',
      items: [
        {
          id: 'demo-item-5',
          type: 'trail',
          trailId: 't006',
          customTitle: null,
          customActivityType: null,
          notes: 'Fisher Towers at sunrise for photos',
          timeSlot: 'morning',
        },
      ],
    },
  ] as TripDay[],
};

export const DEMO_PREFERENCES = {
  units: 'imperial' as const,
  quizResults: {
    difficulty: 'blue',
    activities: ['mtb', 'hiking'],
    distance: 'moderate',
    results: [
      { trailId: 't005', matchScore: 95 },
      { trailId: 't004', matchScore: 88 },
      { trailId: 't006', matchScore: 82 },
    ],
    completedAt: daysAgo(1),
  },
};
