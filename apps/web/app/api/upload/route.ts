import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Allowed MIME types and max file size
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// POST /api/upload — Upload an image to Supabase Storage
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

  // 5. Upload to Supabase Storage via admin client (bypasses RLS)
  const bucket = (formData.get('bucket') as string) || 'photos';
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

  const adminClient = createSupabaseAdmin();
  const { error: uploadError } = await adminClient.storage
    .from(bucket)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 },
    );
  }

  // 6. Get the public URL
  const {
    data: { publicUrl },
  } = adminClient.storage.from(bucket).getPublicUrl(storagePath);

  return NextResponse.json({ url: publicUrl });
}
