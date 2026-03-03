'use client';

import { useState } from 'react';
import { Share2, Copy } from 'lucide-react';
import { encodeTripState } from '@/lib/trip-share';
import { Toast } from '@/components/ui/Toast';
import type { TripState } from '@/lib/trip-types';

interface ShareTripButtonProps {
  state: TripState;
}

export function ShareTripButton({ state }: ShareTripButtonProps) {
  const [toastVisible, setToastVisible] = useState(false);

  async function handleShare() {
    const encoded = encodeTripState(state);
    const url = `${window.location.origin}/trip/shared?data=${encoded}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Cairn Connect Trip',
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setToastVisible(true);
  }

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-xl bg-cairn-card border border-cairn-border px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-cairn-card-hover hover:text-white transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share Trip
      </button>
      <Toast
        message="Trip link copied to clipboard"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
