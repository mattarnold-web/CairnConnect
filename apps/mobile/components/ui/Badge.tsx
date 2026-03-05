import { View, Text } from 'react-native';
import { clsx } from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'green' | 'blue' | 'black' | 'red' | 'amber' | 'purple' | 'gold';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-cairn-elevated',
  green: 'bg-emerald-500/20',
  blue: 'bg-blue-500/20',
  black: 'bg-slate-600/40',
  red: 'bg-red-500/20',
  amber: 'bg-amber-500/20',
  purple: 'bg-purple-500/20',
  gold: 'bg-spotlight-gold/20',
};

const variantTextStyles = {
  default: 'text-slate-300',
  green: 'text-emerald-400',
  blue: 'text-blue-400',
  black: 'text-slate-300',
  red: 'text-red-400',
  amber: 'text-amber-400',
  purple: 'text-purple-400',
  gold: 'text-spotlight-gold',
};

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <View
      className={clsx(
        'rounded-full self-start',
        variantStyles[variant],
        size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1',
      )}
    >
      <Text
        className={clsx(
          'font-semibold',
          variantTextStyles[variant],
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}
      >
        {label}
      </Text>
    </View>
  );
}

const DIFFICULTY_VARIANT_MAP: Record<string, BadgeProps['variant']> = {
  green: 'green',
  blue: 'blue',
  black: 'black',
  double_black: 'black',
  proline: 'red',
};

const DIFFICULTY_LABEL_MAP: Record<string, string> = {
  green: 'Easy',
  blue: 'Intermediate',
  black: 'Advanced',
  double_black: 'Expert',
  proline: 'Pro Line',
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <Badge
      label={DIFFICULTY_LABEL_MAP[difficulty] ?? difficulty}
      variant={DIFFICULTY_VARIANT_MAP[difficulty] ?? 'default'}
    />
  );
}

const CONDITION_VARIANT_MAP: Record<string, BadgeProps['variant']> = {
  open: 'green',
  caution: 'amber',
  closed: 'red',
  unknown: 'default',
};

export function ConditionBadge({ condition }: { condition: string }) {
  return (
    <Badge
      label={condition.charAt(0).toUpperCase() + condition.slice(1)}
      variant={CONDITION_VARIANT_MAP[condition] ?? 'default'}
    />
  );
}
