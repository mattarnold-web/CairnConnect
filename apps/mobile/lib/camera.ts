import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIR = `${FileSystem.documentDirectory}photos/`;

export async function ensurePhotosDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

/**
 * Save a photo to the app's documents directory.
 * Embeds GPS coordinates in the filename for easy retrieval.
 */
export async function savePhoto(
  uri: string,
  id: string,
  lat?: number | null,
  lng?: number | null,
): Promise<string> {
  await ensurePhotosDir();

  // Embed GPS in filename: photo_<id>_lat_lng.jpg
  let filename = id;
  if (lat != null && lng != null) {
    const latStr = lat.toFixed(6).replace('.', 'd').replace('-', 'n');
    const lngStr = lng.toFixed(6).replace('.', 'd').replace('-', 'n');
    filename = `${id}_gps_${latStr}_${lngStr}`;
  }

  const destPath = `${PHOTOS_DIR}${filename}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: destPath });
  return destPath;
}

/**
 * Delete a photo by its id. Searches for files matching the id prefix
 * to handle GPS-tagged filenames.
 */
export async function deletePhoto(id: string): Promise<void> {
  await ensurePhotosDir();
  const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
  const matching = files.filter((f) => f.startsWith(id));

  for (const file of matching) {
    const path = `${PHOTOS_DIR}${file}`;
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
      await FileSystem.deleteAsync(path);
    }
  }
}

/**
 * Get the URI for a photo by id. Searches for GPS-tagged filenames too.
 */
export async function getPhotoUri(id: string): Promise<string | null> {
  await ensurePhotosDir();
  const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
  const match = files.find((f) => f.startsWith(id));
  if (match) return `${PHOTOS_DIR}${match}`;
  // Fallback to direct path
  const direct = `${PHOTOS_DIR}${id}.jpg`;
  const info = await FileSystem.getInfoAsync(direct);
  return info.exists ? direct : null;
}

/**
 * Extract GPS coordinates from a GPS-tagged photo filename.
 */
export function extractGpsFromFilename(
  filename: string,
): { lat: number; lng: number } | null {
  const match = filename.match(/_gps_(n?\d+d\d+)_(n?\d+d\d+)\.jpg$/);
  if (!match) return null;

  const parsePart = (s: string): number => {
    let val = s.replace('d', '.').replace('n', '-');
    return parseFloat(val);
  };

  return {
    lat: parsePart(match[1]),
    lng: parsePart(match[2]),
  };
}

/**
 * List all photo files in the photos directory.
 */
export async function listPhotos(): Promise<string[]> {
  await ensurePhotosDir();
  const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
  return files.filter((f) => f.endsWith('.jpg'));
}

/**
 * Get the full photos directory path.
 */
export function getPhotosDir(): string {
  return PHOTOS_DIR;
}
