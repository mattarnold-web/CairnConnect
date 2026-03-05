import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase';

/**
 * Returns true when Supabase env vars are present (i.e. not in mock-data mode).
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Create a Supabase server client using the current request cookies.
 * Only call this after confirming `isSupabaseConfigured()`.
 */
export function getServerClient() {
  const cookieStore = cookies();
  return createSupabaseServer(cookieStore);
}
