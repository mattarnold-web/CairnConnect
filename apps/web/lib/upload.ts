// ---------------------------------------------------------------------------
// Client-side image upload helper
// ---------------------------------------------------------------------------

/**
 * Upload an image file to the server and return its public URL.
 *
 * @param file   - The image File to upload (JPEG, PNG, or WebP, max 10 MB)
 * @param bucket - Optional Supabase Storage bucket name (default: "photos")
 * @returns The public URL of the uploaded image
 * @throws Error if the upload fails
 */
export async function uploadImage(
  file: File,
  bucket?: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  if (bucket) {
    formData.append('bucket', bucket);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Upload failed (${response.status})`);
  }

  const { url } = await response.json();
  return url;
}
