import { Pressable, Text, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface ButtonProps {
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'spotlight';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  primary: 'bg-canopy active:bg-canopy-dark',
  secondary: 'bg-cairn-card border border-cairn-border active:bg-cairn-card-hover',
  ghost: 'bg-transparent active:bg-cairn-card',
  destructive: 'bg-red-600 active:bg-red-700',
  spotlight: 'bg-spotlight-gold active:bg-spotlight-gold-dark',
};

const variantTextStyles = {
  primary: 'text-white font-semibold',
  secondary: 'text-slate-300 font-medium',
  ghost: 'text-slate-300 font-medium',
  destructive: 'text-white font-semibold',
  spotlight: 'text-white font-semibold',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 rounded-lg',
  md: 'px-4 py-2.5 rounded-xl',
  lg: 'px-6 py-3.5 rounded-xl',
};

const sizeTextStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function Button({
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={clsx(
        'flex-row items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : typeof children === 'string' ? (
        <Text className={clsx(variantTextStyles[variant], sizeTextStyles[size])}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
