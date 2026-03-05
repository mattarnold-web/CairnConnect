import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Allowed MIME types and max file size for avatars
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Avatar resize note:
// For best performance, avatars should be resized to ~256x256 before upload.
// This can be done client-side (e.g. using canvas or a library like browser-image-compression)
// or via Supabase Image Transforms when serving the image (append ?width=256&height=256).

// ---------------------------------------------------------------------------
// POST /api/upload/avatar — Upload or replace the user's avatar
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing "file" field' },
      { status: 400 },
    );
  }

  // 2. Validate file type
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type "${file.type}". Allowed: JPEG, PNG, WebP.` },
      { status: 400 },
    );
  }

  // 3. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.` },
      { status: 400 },
    );
  }

  // 4. Authenticate user
  const cookieStore = cookies();
  const supabase = createSupabaseServer(cookieStore);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  // 5. Determine file extension and storage path
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const storagePath = `${user.id}/avatar.${ext}`;

  // 6. Upload to 'avatars' bucket (upsert to overwrite previous avatar)
  const adminClient = createSupabaseAdmin();
  const { error: uploadError } = await adminClient.storage
    .from('avatars')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: true, // Overwrite existing avatar
    });

  if (uploadError) {
    console.error('Avatar upload error:', uploadError);
    return NextResponse.json(
      { error: 'Avatar upload failed' },
      { status: 500 },
    );
  }

  // 7. Get the public URL
  const {
    data: { publicUrl },
  } = adminClient.storage.from('avatars').getPublicUrl(storagePath);

  // 8. Update the user's profile with the new avatar URL
  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (updateError) {
    console.error('Profile update error:', updateError);
    // The image was uploaded successfully, so still return the URL
    // but warn about the profile update failure.
    return NextResponse.json(
      { url: publicUrl, warning: 'Avatar uploaded but profile update failed' },
      { status: 200 },
    );
  }

  return NextResponse.json({ url: publicUrl });
}
