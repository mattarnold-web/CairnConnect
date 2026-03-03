'use client';

import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'spotlight' | 'condition' | 'difficulty' | 'postType';
  color?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', color, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        variant === 'default' && 'bg-cairn-elevated text-slate-300',
        variant === 'spotlight' && 'bg-spotlight-gold/20 text-spotlight-gold border border-spotlight-gold/30',
        variant === 'condition' && 'border',
        variant === 'difficulty' && 'border',
        variant === 'postType' && 'uppercase tracking-wider',
        className
      )}
      style={color ? {
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      } : undefined}
    >
      {children}
    </span>
  );
}
