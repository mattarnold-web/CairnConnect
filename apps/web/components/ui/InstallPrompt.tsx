'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../../lib/pwa';

const DISMISS_KEY = 'cairn-install-prompt-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) {
        setDismissed(true);
        return;
      }
      // Dismissal has expired, clear it
      localStorage.removeItem(DISMISS_KEY);
    }
    setDismissed(false);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = () => {
    promptInstall();
  };

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-cairn-card border border-cairn-border rounded-2xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Download className="h-5 w-5 text-canopy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200">
              Add Cairn Connect to your home screen for quick access
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="inline-flex items-center justify-center rounded-xl bg-canopy text-white text-sm font-semibold px-4 h-9 hover:bg-canopy-dark transition-colors active:scale-[0.97]"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center justify-center rounded-xl text-sm text-slate-400 hover:text-slate-200 px-3 h-9 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
