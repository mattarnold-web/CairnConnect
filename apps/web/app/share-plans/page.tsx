'use client';

import { useState } from 'react';
import {
  Phone,
  Users,
  Cloud,
  Backpack,
  AlertTriangle,
  MapPin,
  Clock,
  Navigation,
  Bell,
  Shield,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

/* ---------- page ---------- */

export default function SharePlansPage() {
  const [locationSharing, setLocationSharing] = useState(true);
  const [overdueAlert, setOverdueAlert] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);

  /* Emergency contact form state */
  const [contactName, setContactName] = useState('John Smith');
  const [contactPhone, setContactPhone] = useState('(555) 123-4567');
  const [contactRelationship, setContactRelationship] = useState('Brother');

  const SAFETY_TIPS = [
    { label: 'Tell someone', Icon: Users },
    { label: 'Check weather', Icon: Cloud },
    { label: 'Carry essentials', Icon: Backpack },
    { label: 'Know your limits', Icon: AlertTriangle },
  ];

  const TRIP_DETAILS = [
    { label: 'Trail', value: 'Eagle Creek Trail' },
    { label: 'Start', value: 'Tomorrow, 8:00 AM' },
    { label: 'Expected Return', value: 'Tomorrow, 3:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Share Your Plans
          </h1>
        </div>

        {/* Emergency Contact Card */}
        <div className="rounded-xl border border-cairn-border bg-cairn-card p-5 mb-5">
          <h2 className="font-display text-base font-semibold text-[var(--text-primary)] mb-4">
            Emergency Contact
          </h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1">
                Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-cairn-border bg-cairn-elevated px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-canopy"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full rounded-lg border border-cairn-border bg-cairn-elevated px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-canopy"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={contactRelationship}
                onChange={(e) => setContactRelationship(e.target.value)}
                className="w-full rounded-lg border border-cairn-border bg-cairn-elevated px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-canopy"
              />
            </div>
          </div>
        </div>

        {/* Trip Summary Card */}
        <div className="rounded-xl border border-cairn-border bg-cairn-card p-5 mb-5">
          <h2 className="font-display text-base font-semibold text-[var(--text-primary)] mb-4">
            Trip Summary
          </h2>

          <div className="flex flex-col divide-y divide-cairn-border">
            {TRIP_DETAILS.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-[var(--text-secondary)]">
                  {row.label}
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Location Sharing */}
        <div className="rounded-xl border border-cairn-border bg-cairn-card p-5 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
                Real-time Location Sharing
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'text-xs font-semibold',
                  locationSharing ? 'text-canopy' : 'text-[var(--text-tertiary)]'
                )}
              >
                {locationSharing ? 'ON' : 'OFF'}
              </span>
              <button
                onClick={() => setLocationSharing(!locationSharing)}
                className={clsx(
                  'relative w-11 h-6 rounded-full transition-colors',
                  locationSharing ? 'bg-canopy' : 'bg-cairn-border'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                    locationSharing && 'translate-x-5'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={() => setCheckedIn(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-canopy px-6 py-3.5 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
          >
            <Check className="w-4 h-4" />
            {checkedIn ? 'Checked In!' : 'Check In Safely'}
          </button>

          <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            <Phone className="w-4 h-4" />
            EMERGENCY SOS
          </button>
        </div>

        {/* Safety Tips Row */}
        <div className="rounded-xl border border-cairn-border bg-cairn-card p-5 mb-5">
          <h2 className="font-display text-base font-semibold text-[var(--text-primary)] mb-4">
            Safety Tips
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SAFETY_TIPS.map((tip) => {
              const Icon = tip.Icon;
              return (
                <div
                  key={tip.label}
                  className="flex flex-col items-center gap-2 rounded-lg border border-cairn-border bg-cairn-elevated p-4"
                >
                  <Icon className="w-6 h-6 text-canopy" />
                  <span className="text-xs text-center text-[var(--text-secondary)]">
                    {tip.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue Alert Section */}
        <div className="rounded-xl border border-cairn-border bg-cairn-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <p className="text-sm text-[var(--text-primary)]">
                Send alert if not checked in by{' '}
                <span className="font-semibold">6:00 PM</span>
              </p>
            </div>
            <button
              onClick={() => setOverdueAlert(!overdueAlert)}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
                overdueAlert ? 'bg-canopy' : 'bg-cairn-border'
              )}
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                  overdueAlert && 'translate-x-5'
                )}
              />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
