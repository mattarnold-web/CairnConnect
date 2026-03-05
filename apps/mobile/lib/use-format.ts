import { usePreferences } from './preferences-context';
import {
  formatDistance as sharedFormatDistance,
  formatElevation as sharedFormatElevation,
  formatDuration as sharedFormatDuration,
  formatSpeed as sharedFormatSpeed,
} from '@cairn/shared';

export function formatDurationMinutes(minutes: number): string {
  return sharedFormatDuration(minutes * 60);
}

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
