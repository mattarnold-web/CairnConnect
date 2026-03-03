'use client';

import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'spotlight';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.97]',
        // Variants
        variant === 'primary' && 'bg-canopy text-white hover:bg-canopy-dark',
        variant === 'secondary' && 'bg-transparent border border-canopy text-canopy hover:bg-canopy/10',
        variant === 'ghost' && 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-cairn-card',
        variant === 'destructive' && 'bg-red-500 text-white hover:bg-red-600',
        variant === 'spotlight' && 'bg-spotlight-gold text-cairn-bg hover:bg-spotlight-gold-dark font-bold',
        // Sizes
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
