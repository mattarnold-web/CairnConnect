import * as Location from 'expo-location';

// ─── Permissions ────────────────────────────────────────────────

export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') return false;
  return true;
}

export async function requestBackgroundLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === 'granted';
}

// ─── Current Location ───────────────────────────────────────────

export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return null;

    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch {
    return null;
  }
}

// ─── Watch (foreground) ─────────────────────────────────────────

export function watchLocation(
  callback: (location: Location.LocationObject) => void,
): Promise<Location.LocationSubscription> {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 5,
      timeInterval: 3000,
    },
    callback,
  );
}

// ─── Background-aware tracking ──────────────────────────────────

/**
 * Start high-accuracy location tracking suitable for activity recording.
 * Uses BestForNavigation accuracy with frequent updates.
 * NOTE: For true background tracking, expo-task-manager would need to be
 * installed. This uses foreground-optimized settings that work while
 * the app is open or recently backgrounded.
 */
export async function startBackgroundTracking(
  callback: (location: Location.LocationObject) => void,
): Promise<Location.LocationSubscription | null> {
  const hasFg = await requestLocationPermissions();
  if (!hasFg) return null;

  // Request background permission for best tracking continuity
  await requestBackgroundLocationPermission();

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 5,
      timeInterval: 2000,
      mayShowUserSettingsDialog: true,
    },
    callback,
  );
}

// ─── Distance calculation (Haversine) ───────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Returns distance in meters between two lat/lng pairs.
 */
export function calcDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── Speed calculation ──────────────────────────────────────────

export interface GpsPointLike {
  lat: number;
  lng: number;
  altitude: number | null;
  timestamp: number;
}

/**
 * Calculate instantaneous speed (m/s) between two GPS points.
 */
export function calcSpeed(prev: GpsPointLike, curr: GpsPointLike): number {
  const dist = calcDistanceMeters(prev.lat, prev.lng, curr.lat, curr.lng);
  const timeDiff = (curr.timestamp - prev.timestamp) / 1000;
  if (timeDiff <= 0) return 0;
  return dist / timeDiff;
}

/**
 * Calculate average speed over a set of points (m/s).
 */
export function calcAvgSpeed(points: GpsPointLike[]): number {
  if (points.length < 2) return 0;
  let totalDist = 0;
  for (let i = 1; i < points.length; i++) {
    totalDist += calcDistanceMeters(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng,
    );
  }
  const totalTime = (points[points.length - 1].timestamp - points[0].timestamp) / 1000;
  if (totalTime <= 0) return 0;
  return totalDist / totalTime;
}

// ─── Elevation gain calculation ─────────────────────────────────

/** Minimum altitude change (meters) to count as real gain, filtering GPS noise */
const ELEVATION_NOISE_THRESHOLD = 2;

/**
 * Calculate cumulative elevation gain from GPS altitude data.
 * Applies a noise threshold to filter GPS jitter.
 */
export function calcElevationGain(points: GpsPointLike[]): number {
  let gain = 0;
  let lastSignificantAlt: number | null = null;

  for (const pt of points) {
    if (pt.altitude == null) continue;
    if (lastSignificantAlt == null) {
      lastSignificantAlt = pt.altitude;
      continue;
    }

    const diff = pt.altitude - lastSignificantAlt;
    if (Math.abs(diff) >= ELEVATION_NOISE_THRESHOLD) {
      if (diff > 0) gain += diff;
      lastSignificantAlt = pt.altitude;
    }
  }

  return gain;
}

/**
 * Calculate cumulative elevation loss from GPS altitude data.
 */
export function calcElevationLoss(points: GpsPointLike[]): number {
  let loss = 0;
  let lastSignificantAlt: number | null = null;

  for (const pt of points) {
    if (pt.altitude == null) continue;
    if (lastSignificantAlt == null) {
      lastSignificantAlt = pt.altitude;
      continue;
    }

    const diff = pt.altitude - lastSignificantAlt;
    if (Math.abs(diff) >= ELEVATION_NOISE_THRESHOLD) {
      if (diff < 0) loss += Math.abs(diff);
      lastSignificantAlt = pt.altitude;
    }
  }

  return loss;
}

// ─── Utilities ──────────────────────────────────────────────────

export function generateMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function generateShareText(lat: number, lng: number): string {
  const url = generateMapsUrl(lat, lng);
  return `I'm at this location: ${url}`;
}

/**
 * Estimate GPS signal quality from accuracy value.
 * Returns 0-3 bars.
 */
export function gpsSignalBars(accuracy: number | null): number {
  if (accuracy == null) return 0;
  if (accuracy <= 5) return 3;
  if (accuracy <= 15) return 2;
  if (accuracy <= 30) return 1;
  return 0;
}
