'use client';

import { useState } from 'react';
import { WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from '../../lib/pwa';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-amber-500/10 border-b border-amber-500/30">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-sm text-amber-200">
            You&apos;re offline &mdash; some features may be limited
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/60 hover:text-amber-300 transition-colors"
          aria-label="Dismiss offline banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
