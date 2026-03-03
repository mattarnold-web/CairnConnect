'use client';

import { Play } from 'lucide-react';
import { activateDemo } from '@/lib/demo-mode';

export function DemoButton() {
  return (
    <button
      onClick={() => {
        activateDemo();
        window.location.href = '/explore';
      }}
      className="flex items-center gap-2 rounded-xl border border-canopy/30 bg-canopy/10 px-8 py-3.5 text-base font-semibold text-canopy hover:bg-canopy/20 transition-all"
    >
      <Play className="h-5 w-5" />
      Try Demo
    </button>
  );
}
