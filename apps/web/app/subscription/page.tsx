'use client';

import { useState } from 'react';
import {
  CreditCard,
  Check,
  MapPin,
  Users,
  MessageSquare,
  Loader2,
  Rocket,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

// ---------------------------------------------------------------------------
// Mock subscription data
// ---------------------------------------------------------------------------

const CURRENT_PLAN = {
  name: 'Pro Annual',
  status: 'active' as const,
  price: '$80.00',
  interval: 'year',
  renewsOn: 'March 15, 2027',
  benefits: [
    'Offline maps unlimited',
    'Device sync all platforms',
    'Unlimited Activity Board posts',
    'Advanced filters',
    'Ad-free experience',
    'Priority support',
  ],
};

const USAGE_STATS = [
  { label: 'Downloaded regions', value: 5, icon: MapPin },
  { label: 'Synced activities', value: 142, icon: Users },
  { label: 'Board posts', value: 23, icon: MessageSquare },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SubscriptionPage() {
  const [manageLoading, setManageLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleManageSubscription() {
    setError(null);
    setManageLoading(true);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setManageLoading(false);
    }
  }

  async function handleCancelSubscription() {
    setError(null);
    setCancelLoading(true);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setCancelLoading(false);
      setShowCancelDialog(false);
    }
  }

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 pt-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="h-6 w-6 text-canopy" />
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Your Subscription
          </h1>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Current Plan Card */}
        <section className="mb-8">
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-6">
            {/* Plan name badge */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Current plan</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-canopy/15 border border-canopy/30 px-3 py-1 text-xs font-semibold text-canopy">
                {CURRENT_PLAN.name}
              </span>
            </div>

            {/* Price */}
            <div className="mb-1">
              <span className="font-display text-4xl font-bold text-[var(--text-primary)]">
                {CURRENT_PLAN.price}
              </span>
              <span className="text-[var(--text-tertiary)] text-lg">
                /{CURRENT_PLAN.interval}
              </span>
            </div>

            {/* Renewal date */}
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Renews on {CURRENT_PLAN.renewsOn}
            </p>

            {/* Benefits list */}
            <ul className="space-y-3 mb-6">
              {CURRENT_PLAN.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Check className="h-4 w-4 text-canopy shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Manage Subscription button */}
            <button
              onClick={handleManageSubscription}
              disabled={manageLoading}
              className={clsx(
                'w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors',
                'bg-canopy hover:bg-canopy-dark disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {manageLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Manage Subscription'
              )}
            </button>
          </div>
        </section>

        {/* Usage Stats */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">
            Usage Stats
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card divide-y divide-cairn-border">
            {USAGE_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {stat.label}
                    </span>
                  </div>
                  <span className="font-display text-base font-bold text-[var(--text-primary)]">
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upgrade Options / Add-on */}
        <section className="mb-8">
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canopy/10">
                <Rocket className="h-5 w-5 text-canopy" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                  Terra API add-on
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                  For 30+ wearables
                </p>
              </div>
              <button className="shrink-0 rounded-lg bg-canopy px-4 py-2 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Cancel Subscription */}
        <div className="text-center">
          <button
            onClick={() => setShowCancelDialog(true)}
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !cancelLoading && setShowCancelDialog(false)}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-md rounded-2xl border border-cairn-border bg-cairn-card p-6 shadow-xl">
            <button
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelLoading}
              className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-2">
              Cancel Subscription?
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Are you sure you want to cancel your {CURRENT_PLAN.name} plan? You will
              lose access to premium features at the end of your current billing period
              on {CURRENT_PLAN.renewsOn}.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelLoading}
                className="flex-1 rounded-xl border border-cairn-border bg-cairn-elevated py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-cairn-card-hover transition-colors disabled:opacity-50"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className={clsx(
                  'flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-colors',
                  'bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2'
                )}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
