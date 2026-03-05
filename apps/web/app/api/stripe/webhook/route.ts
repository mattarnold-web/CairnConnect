import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, PRICE_TO_TIER } from '@/lib/stripe';
import { createSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

// Disable Next.js body parsing so we can verify the raw webhook signature
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdmin();

  try {
    switch (event.type) {
      // -----------------------------------------------------------------
      // Checkout completed — activate subscription
      // -----------------------------------------------------------------
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== 'subscription' || !session.subscription) break;

        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.error('[stripe/webhook] Missing supabase_user_id in metadata');
          break;
        }

        // Retrieve full subscription to get the price ID
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        const priceId = subscription.items.data[0]?.price?.id;
        const tier = priceId ? PRICE_TO_TIER[priceId] : null;

        await admin
          .from('profiles')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            subscription_tier: tier || 'unknown',
            subscription_status: subscription.status,
          })
          .eq('id', userId);

        break;
      }

      // -----------------------------------------------------------------
      // Subscription updated (upgrade, downgrade, renewal)
      // -----------------------------------------------------------------
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId =
          subscription.metadata?.supabase_user_id ??
          (await resolveUserId(admin, subscription.customer as string));

        if (!userId) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const tier = priceId ? PRICE_TO_TIER[priceId] : null;

        await admin
          .from('profiles')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_tier: tier || 'unknown',
            subscription_status: subscription.status,
          })
          .eq('id', userId);

        break;
      }

      // -----------------------------------------------------------------
      // Subscription deleted — downgrade to free
      // -----------------------------------------------------------------
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId =
          subscription.metadata?.supabase_user_id ??
          (await resolveUserId(admin, subscription.customer as string));

        if (!userId) break;

        await admin
          .from('profiles')
          .update({
            stripe_subscription_id: null,
            subscription_tier: 'free',
            subscription_status: 'canceled',
          })
          .eq('id', userId);

        break;
      }

      // -----------------------------------------------------------------
      // Payment failed
      // -----------------------------------------------------------------
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;

        if (!customerId) break;

        const userId = await resolveUserId(admin, customerId);
        if (!userId) break;

        await admin
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', userId);

        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] Error handling ${event.type}:`, err);
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Helper: look up Supabase user ID by stripe_customer_id
// ---------------------------------------------------------------------------

async function resolveUserId(
  admin: ReturnType<typeof createSupabaseAdmin>,
  stripeCustomerId: string,
): Promise<string | null> {
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (!data) {
    console.error(
      `[stripe/webhook] No profile found for customer ${stripeCustomerId}`,
    );
    return null;
  }

  return data.id;
}
