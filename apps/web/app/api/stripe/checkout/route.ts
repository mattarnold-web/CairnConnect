import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { stripe, PRICE_IDS } from '@/lib/stripe';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase';

// Map friendly tier names to Stripe price IDs
const TIER_TO_PRICE: Record<string, string> = {
  founding: PRICE_IDS.SPOTLIGHT_FOUNDING,
  standard: PRICE_IDS.SPOTLIGHT_STANDARD,
  premium: PRICE_IDS.SPOTLIGHT_PREMIUM,
  pro_monthly: PRICE_IDS.PRO_MONTHLY,
  pro_annual: PRICE_IDS.PRO_ANNUAL,
};

const ALLOWED_PRICE_IDS = new Set(Object.values(PRICE_IDS));

export async function POST(request: NextRequest) {
  try {
    const { priceId: rawPriceId, tier, mode = 'subscription', successUrl, cancelUrl } =
      await request.json();

    // Resolve the price ID — accept either a tier name or a raw price ID
    let priceId: string | undefined;
    if (tier) {
      priceId = TIER_TO_PRICE[tier.toLowerCase()];
    } else {
      priceId = rawPriceId;
    }

    if (!priceId || !ALLOWED_PRICE_IDS.has(priceId)) {
      return NextResponse.json(
        { error: 'Invalid or missing tier / priceId' },
        { status: 400 },
      );
    }

    // Authenticate the user
    const cookieStore = cookies();
    const supabase = createSupabaseServer(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create Stripe customer
    const admin = createSupabaseAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      stripeCustomerId = customer.id;

      await admin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Build Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: mode as 'subscription' | 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${appUrl}/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${appUrl}/dashboard/upgrade?checkout=cancelled`,
      subscription_data:
        mode === 'subscription'
          ? { metadata: { supabase_user_id: user.id } }
          : undefined,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('[stripe/checkout] Error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
