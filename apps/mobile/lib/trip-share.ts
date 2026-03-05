import type { TripState } from './trip-types';

// Base64 lookup table for encoding/decoding without relying on
// TextEncoder / TextDecoder / btoa / atob which are unavailable in
// React Native's JSC/Hermes environment.
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encodeBase64(input: string): string {
  let result = '';
  const utf8: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let charCode = input.charCodeAt(i);
    if (charCode < 0x80) {
      utf8.push(charCode);
    } else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode >= 0xd800 && charCode < 0xdc00) {
      // surrogate pair
      i++;
      const low = input.charCodeAt(i);
      const codePoint = ((charCode - 0xd800) << 10) + (low - 0xdc00) + 0x10000;
      utf8.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    } else {
      utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
    }
  }
  for (let i = 0; i < utf8.length; i += 3) {
    const b0 = utf8[i];
    const b1 = i + 1 < utf8.length ? utf8[i + 1] : 0;
    const b2 = i + 2 < utf8.length ? utf8[i + 2] : 0;
    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < utf8.length ? BASE64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < utf8.length ? BASE64_CHARS[b2 & 63] : '=';
  }
  return result;
}

function decodeBase64(input: string): string {
  // Remove padding
  const cleaned = input.replace(/=+$/, '');
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    const b0 = BASE64_CHARS.indexOf(cleaned[i]);
    const b1 = i + 1 < cleaned.length ? BASE64_CHARS.indexOf(cleaned[i + 1]) : 0;
    const b2 = i + 2 < cleaned.length ? BASE64_CHARS.indexOf(cleaned[i + 2]) : 0;
    const b3 = i + 3 < cleaned.length ? BASE64_CHARS.indexOf(cleaned[i + 3]) : 0;
    bytes.push((b0 << 2) | (b1 >> 4));
    if (i + 2 < cleaned.length) bytes.push(((b1 & 15) << 4) | (b2 >> 2));
    if (i + 3 < cleaned.length) bytes.push(((b2 & 3) << 6) | b3);
  }
  // Decode UTF-8 bytes to string
  let result = '';
  for (let i = 0; i < bytes.length; ) {
    const byte = bytes[i];
    if (byte < 0x80) {
      result += String.fromCharCode(byte);
      i++;
    } else if ((byte & 0xe0) === 0xc0) {
      result += String.fromCharCode(((byte & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if ((byte & 0xf0) === 0xe0) {
      result += String.fromCharCode(
        ((byte & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else {
      const codePoint =
        ((byte & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      // Convert to surrogate pair
      const adjusted = codePoint - 0x10000;
      result += String.fromCharCode(0xd800 + (adjusted >> 10), 0xdc00 + (adjusted & 0x3ff));
      i += 4;
    }
  }
  return result;
}

function toUrlSafeBase64(str: string): string {
  return encodeBase64(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeBase64(encoded: string): string {
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return decodeBase64(base64);
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
