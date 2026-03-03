'use client';

import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { decodeTripState } from '@/lib/trip-share';
import { Navbar } from '@/components/layout/Navbar';
import { TripSummary } from '@/components/trip/TripSummary';
import type { TripState } from '@/lib/trip-types';

export default function SharedTripPage() {
  const [decodedState, setDecodedState] = useState<TripState | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (!data) {
      setError(true);
      return;
    }

    const state = decodeTripState(data);
    if (!state) {
      setError(true);
      return;
    }

    setDecodedState(state);
  }, []);

  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />
      <main className="pt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        {error ? (
          <div className="text-center py-20">
            <p className="text-lg text-slate-400">
              Unable to load shared trip. The link may be invalid or expired.
            </p>
          </div>
        ) : decodedState ? (
          <>
            <div className="mb-6 flex items-center gap-2 text-sm text-canopy">
              <Share2 className="h-4 w-4" />
              Shared Trip
            </div>
            <TripSummary state={decodedState} dispatch={() => {}} readOnly />
          </>
        ) : null}
      </main>
    </div>
  );
}
