import { usePreferences, type UnitSystem } from './preferences-context';
import {
  formatDistance as sharedFormatDistance,
  formatElevation as sharedFormatElevation,
  formatDuration as sharedFormatDuration,
  formatSpeed as sharedFormatSpeed,
} from '@cairn/shared';

/**
 * Format duration from minutes (mock data stores minutes, shared package takes seconds).
 */
export function formatDurationMinutes(minutes: number): string {
  return sharedFormatDuration(minutes * 60);
}

/**
 * Hook that provides unit-aware format functions using the user's preferences.
 */
export function useFormat() {
  const { preferences } = usePreferences();
  const units = preferences.units;

  return {
    distance: (meters: number) => sharedFormatDistance(meters, units),
    elevation: (meters: number) => sharedFormatElevation(meters, units),
    duration: (minutes: number) => formatDurationMinutes(minutes),
    speed: (metersPerSecond: number) => sharedFormatSpeed(metersPerSecond, units),
    units,
  };
}
