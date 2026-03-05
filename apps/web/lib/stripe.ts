import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

// ---------------------------------------------------------------------------
// Price ID constants
// ---------------------------------------------------------------------------

export const PRICE_IDS = {
  SPOTLIGHT_FOUNDING: process.env.STRIPE_SPOTLIGHT_FOUNDING_PRICE_ID!,
  SPOTLIGHT_STANDARD: process.env.STRIPE_SPOTLIGHT_STANDARD_PRICE_ID!,
  SPOTLIGHT_PREMIUM: process.env.STRIPE_SPOTLIGHT_PREMIUM_PRICE_ID!,
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  PRO_ANNUAL: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
} as const;

// Map price IDs to subscription tier names for database storage
export const PRICE_TO_TIER: Record<string, string> = {
  [PRICE_IDS.SPOTLIGHT_FOUNDING]: 'spotlight_founding',
  [PRICE_IDS.SPOTLIGHT_STANDARD]: 'spotlight_standard',
  [PRICE_IDS.SPOTLIGHT_PREMIUM]: 'spotlight_premium',
  [PRICE_IDS.PRO_MONTHLY]: 'pro',
  [PRICE_IDS.PRO_ANNUAL]: 'pro',
};
