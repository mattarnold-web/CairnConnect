'use client';

import { clsx } from 'clsx';

interface FilterChipProps {
  label: string;
  emoji?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, emoji, icon, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap',
        'transition-all duration-200 border',
        active
          ? 'bg-canopy/15 border-canopy text-canopy'
          : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400'
      )}
    >
      {icon || (emoji && <span className="text-base">{emoji}</span>)}
      {label}
    </button>
  );
}
