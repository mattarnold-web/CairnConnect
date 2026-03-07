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
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        // Variants
        variant === 'primary' && 'bg-canopy text-white hover:bg-canopy-dark shadow-sm',
        variant === 'secondary' && 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm',
        variant === 'ghost' && 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100',
        variant === 'destructive' && 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        variant === 'spotlight' && 'bg-spotlight-gold text-white hover:bg-spotlight-gold-dark font-bold shadow-sm',
        // Sizes
        size === 'sm' && 'h-8 px-3.5 text-sm',
        size === 'md' && 'h-10 px-5 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
