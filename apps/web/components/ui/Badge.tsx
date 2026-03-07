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
        variant === 'default' && 'bg-gray-100 text-gray-600',
        variant === 'spotlight' && 'bg-spotlight-gold-bg text-spotlight-gold',
        variant === 'condition' && 'border border-gray-200',
        variant === 'difficulty' && 'border border-gray-200',
        variant === 'postType' && 'uppercase tracking-wider text-[11px]',
        className
      )}
      style={color ? {
        backgroundColor: `${color}10`,
        color: color,
      } : undefined}
    >
      {children}
    </span>
  );
}
