import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from './database-types';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ---------------------------------------------------------------------------
// Browser client (use in 'use client' components)
// ---------------------------------------------------------------------------

export function createSupabaseBrowser() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ---------------------------------------------------------------------------
// Server client (use in Server Components / Route Handlers / Server Actions)
// ---------------------------------------------------------------------------

export function createSupabaseServer(cookieStore: {
  getAll: () => { name: string; value: string }[];
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
}) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Record<string, unknown>),
          );
        } catch {
          // The `setAll` method is called from a Server Component —
          // this can be ignored if middleware refreshes user sessions.
        }
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Admin client (service role — server-only, bypasses RLS)
// ---------------------------------------------------------------------------

export function createSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
