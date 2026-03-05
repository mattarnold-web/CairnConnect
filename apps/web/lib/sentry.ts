/**
 * Sentry Error Monitoring - Stub / Helper
 *
 * How to set up Sentry for CairnConnect:
 *
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new project (choose Next.js as the platform)
 * 3. Copy the DSN from Project Settings > Client Keys (DSN)
 * 4. Set NEXT_PUBLIC_SENTRY_DSN in your .env file
 * 5. Set SENTRY_AUTH_TOKEN for source map uploads (optional, from Sentry > Settings > Auth Tokens)
 * 6. Install the SDK: pnpm add @sentry/nextjs --filter web
 * 7. Run: npx @sentry/wizard@latest -i nextjs (to generate sentry config files)
 *
 * Until @sentry/nextjs is installed, this module exports no-op helpers
 * so the rest of the codebase can call captureException / captureMessage
 * without breaking the build.
 */

let SentryModule: typeof import('@sentry/nextjs') | null = null;

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

async function loadSentry() {
  if (SentryModule !== null || !DSN) return;

  try {
    // Dynamic import so the build doesn't fail when @sentry/nextjs isn't installed
    SentryModule = await import('@sentry/nextjs');
    SentryModule.init({
      dsn: DSN,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      environment: process.env.NODE_ENV,
    });
  } catch {
    // @sentry/nextjs is not installed yet - that's fine, we'll use no-ops
    SentryModule = null;
  }
}

// Kick off loading (fire-and-forget)
if (DSN) {
  loadSentry();
}

/**
 * Capture an exception and send it to Sentry.
 * No-op if Sentry is not configured.
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (SentryModule) {
    SentryModule.captureException(error, { extra: context });
  }
}

/**
 * Capture a message and send it to Sentry.
 * No-op if Sentry is not configured.
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (SentryModule) {
    SentryModule.captureMessage(message, level);
  }
}
