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
        'rounded-xl bg-white border p-4',
        spotlight
          ? 'border-l-[3px] border-l-spotlight-gold border-gray-200 spotlight-glow'
          : 'border-gray-200',
        hover && 'transition-all duration-200 hover:shadow-card-hover cursor-pointer',
        'shadow-card',
        className
      )}
    >
      {children}
    </div>
  );
}
