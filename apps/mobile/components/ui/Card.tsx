import { View } from 'react-native';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={clsx(
        'bg-cairn-card border border-cairn-border rounded-2xl p-4',
        className,
      )}
    >
      {children}
    </View>
  );
}
