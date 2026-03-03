'use client';

import { Sparkles } from 'lucide-react';

interface SpotlightBadgeProps {
  tier?: string | null;
  size?: 'sm' | 'md';
}

export function SpotlightBadge({ tier, size = 'sm' }: SpotlightBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-spotlight-gold/20 border border-spotlight-gold/40 px-2 py-0.5 text-spotlight-gold">
      <Sparkles className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      <span className={`font-bold uppercase tracking-wider ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
        {tier === 'founding' ? 'Founding' : 'Spotlight'}
      </span>
    </span>
  );
}
