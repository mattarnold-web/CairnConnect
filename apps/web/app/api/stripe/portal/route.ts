import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createSupabaseServer(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/dashboard/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/portal] Error:', err);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 },
    );
  }
}
