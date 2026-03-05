import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Rate Limiting Note:
// Rate limiting should be handled at the edge/CDN level (Vercel Edge Config,
// Cloudflare Rate Limiting, or AWS WAF). Middleware runs on every matched
// request and is not the right place for stateful rate-limit counters.
// ---------------------------------------------------------------------------

const PROTECTED_ROUTES = ['/profile', '/settings', '/record', '/dashboard', '/trip'];
const AUTH_ROUTES = ['/auth/login'];

const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

// Paths excluded from CSRF origin validation
const CSRF_EXCLUDED_PATHS = ['/api/stripe/webhook'];

/** Append security headers to a response. */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

/** Validate that the Origin header matches the host for mutation requests. */
function csrfCheck(request: NextRequest): NextResponse | null {
  if (!MUTATION_METHODS.has(request.method)) return null;

  const pathname = request.nextUrl.pathname;
  if (CSRF_EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return null;

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // If there is no Origin header, block the request (except excluded paths above)
  if (!origin) {
    return new NextResponse('Forbidden — missing Origin header', { status: 403 });
  }

  try {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      return new NextResponse('Forbidden — origin mismatch', { status: 403 });
    }
  } catch {
    return new NextResponse('Forbidden — invalid Origin header', { status: 403 });
  }

  return null;
}

export async function middleware(request: NextRequest) {
  // --- CSRF Protection ---
  const csrfResponse = csrfCheck(request);
  if (csrfResponse) return applySecurityHeaders(csrfResponse);

  // --- Supabase Auth ---
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth middleware if Supabase is not configured (mock data mode)
  if (!supabaseUrl || !supabaseAnonKey) {
    return applySecurityHeaders(supabaseResponse);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh the session — important for server components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes
  if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectTo', pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Redirect authenticated users away from login page
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/explore';
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    url.searchParams.delete('redirectTo');
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  return applySecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
