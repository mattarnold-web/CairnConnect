'use client';

import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  spotlight?: boolean;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, spotlight, hover = true, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl border bg-cairn-card p-4',
        spotlight
          ? 'border-l-[3px] border-l-spotlight-gold border-cairn-border spotlight-glow'
          : 'border-cairn-border',
        hover && 'transition-colors duration-150 hover:bg-cairn-card-hover cursor-pointer card-press',
        className
      )}
    >
      {children}
    </div>
  );
}
