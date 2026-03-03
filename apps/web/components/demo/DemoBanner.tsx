'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { isDemoMode, deactivateDemo } from '@/lib/demo-mode';

export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isDemoMode());
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] bg-canopy/90 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-3 backdrop-blur-sm">
      <Sparkles className="h-4 w-4 shrink-0" />
      <span>
        <strong>Demo Mode</strong> — Exploring with sample data. Activity history, trip planner, and preferences are pre-filled.
      </span>
      <button
        onClick={() => {
          deactivateDemo();
          window.location.href = '/';
        }}
        className="shrink-0 rounded-md bg-white/20 px-3 py-0.5 text-xs font-semibold hover:bg-white/30 transition-colors"
      >
        Exit Demo
      </button>
      <button
        onClick={() => setVisible(false)}
        className="shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
