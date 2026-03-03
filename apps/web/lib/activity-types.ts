export interface GpsPoint {
  lat: number;
  lng: number;
  altitude: number | null;
  timestamp: number;
  accuracy: number | null;
}

export interface RecordedActivity {
  id: string;
  title: string;
  activityType: string;
  status: 'recording' | 'paused' | 'completed';
  startedAt: string;
  endedAt: string | null;
  gpsTrack: GpsPoint[];
  distanceMeters: number;
  durationSeconds: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  maxElevationMeters: number | null;
  minElevationMeters: number | null;
  photos: string[];
  notes: string;
}
