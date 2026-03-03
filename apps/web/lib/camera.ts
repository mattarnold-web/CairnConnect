import type { CapturedPhoto } from './photo-types';

const JPEG_QUALITY = 0.6;
const MAX_DIMENSION = 1200;

export async function capturePhoto(
  videoElement: HTMLVideoElement,
  activityId: string | null,
  tripId: string | null,
): Promise<CapturedPhoto> {
  // Create canvas and draw current video frame
  const canvas = document.createElement('canvas');
  const vw = videoElement.videoWidth;
  const vh = videoElement.videoHeight;

  // Scale down if needed
  let width = vw;
  let height = vh;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(videoElement, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

  // Try to get GPS coordinates
  let lat: number | null = null;
  let lng: number | null = null;
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      });
    });
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
  } catch {
    // Location unavailable — photo still captured without geotag
  }

  const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    dataUrl,
    lat,
    lng,
    capturedAt: new Date().toISOString(),
    activityId,
    tripId,
    caption: '',
  };
}

export async function openCameraStream(
  facingMode: 'user' | 'environment' = 'environment',
): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });
}

export function stopCameraStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}

// Photo storage helpers — split across keys to stay under localStorage limits
const META_KEY = 'cairn-photos-meta';
const PHOTO_PREFIX = 'cairn-photo-';
const MAX_PHOTOS = 20;

export function loadPhotoMeta(): CapturedPhoto[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePhoto(photo: CapturedPhoto): { saved: boolean; warning?: string } {
  const meta = loadPhotoMeta();

  if (meta.length >= MAX_PHOTOS) {
    return { saved: false, warning: `Photo limit reached (${MAX_PHOTOS}). Delete some photos to make room.` };
  }

  try {
    // Store image data separately
    localStorage.setItem(`${PHOTO_PREFIX}${photo.id}`, photo.dataUrl);
    // Store metadata (without dataUrl to keep meta small)
    const metaEntry = { ...photo, dataUrl: '' };
    meta.push(metaEntry);
    localStorage.setItem(META_KEY, JSON.stringify(meta));
    return { saved: true };
  } catch {
    return { saved: false, warning: 'Storage full. Delete some photos to make room.' };
  }
}

export function loadPhotoData(id: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${PHOTO_PREFIX}${id}`);
}

export function deletePhoto(id: string): void {
  const meta = loadPhotoMeta();
  const updated = meta.filter((p) => p.id !== id);
  localStorage.setItem(META_KEY, JSON.stringify(updated));
  localStorage.removeItem(`${PHOTO_PREFIX}${id}`);
}

export function getPhotoCount(): number {
  return loadPhotoMeta().length;
}
