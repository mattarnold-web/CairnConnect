import type { TripState } from './trip-types';

function toUrlSafeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeBase64(encoded: string): string {
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function encodeTripState(state: TripState): string {
  const minimal = {
    region: state.region,
    selectedActivities: state.selectedActivities,
    startDate: state.startDate,
    days: state.days.map((day) => ({
      id: day.id,
      dayNumber: day.dayNumber,
      date: day.date,
      label: day.label,
      items: day.items,
    })),
    tripName: state.tripName,
  };

  return toUrlSafeBase64(JSON.stringify(minimal));
}

export function decodeTripState(encoded: string): TripState | null {
  try {
    const json = fromUrlSafeBase64(encoded);
    const parsed = JSON.parse(json);

    const state: TripState = {
      id: `shared-${Date.now()}`,
      shareCode: '',
      currentStep: 'summary',
      region: parsed.region ?? null,
      selectedActivities: parsed.selectedActivities ?? [],
      startDate: parsed.startDate ?? null,
      days: parsed.days ?? [],
      tripName: parsed.tripName ?? '',
    };

    return state;
  } catch {
    return null;
  }
}
