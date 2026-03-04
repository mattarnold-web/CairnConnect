'use client';

import { DEMO_ACTIVITIES, DEMO_TRIP, DEMO_PREFERENCES } from './demo-data';

const DEMO_FLAG_KEY = 'cairn-demo-mode';
const ACTIVITY_KEY = 'cairn-activities';
const TRIP_KEY = 'cairn-trip-state';
const PREFERENCES_KEY = 'cairn-preferences';

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_FLAG_KEY) === 'true';
}

export function activateDemo(): void {
  localStorage.setItem(DEMO_FLAG_KEY, 'true');

  localStorage.setItem(
    ACTIVITY_KEY,
    JSON.stringify({
      activities: DEMO_ACTIVITIES,
      activeId: null,
    }),
  );

  localStorage.setItem(TRIP_KEY, JSON.stringify(DEMO_TRIP));

  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEMO_PREFERENCES));
}

export function deactivateDemo(): void {
  localStorage.removeItem(DEMO_FLAG_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
  localStorage.removeItem(TRIP_KEY);
  localStorage.removeItem(PREFERENCES_KEY);
}
