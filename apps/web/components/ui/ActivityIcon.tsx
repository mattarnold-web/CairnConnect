'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Bike,
  Footprints,
  Zap,
  Mountain,
  Ship,
  Waves,
  Tent,
  Droplets,
  Target,
  Snowflake,
  CloudSnow,
  Fish,
  Compass,
  Wind,
  TreePine,
  Anchor,
  Sunrise,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface ActivityConfig {
  slug: string;
  icon: LucideIcon;
  label: string;
  bg: string;
  color: string;
  ring: string;
}

export const ACTIVITY_CONFIG: Record<string, ActivityConfig> = {
  mtb: {
    slug: 'mtb',
    icon: Bike,
    label: 'Mountain Biking',
    bg: 'bg-amber-500/15',
    color: 'text-amber-400',
    ring: 'ring-amber-500/25',
  },
  hiking: {
    slug: 'hiking',
    icon: Footprints,
    label: 'Hiking',
    bg: 'bg-emerald-500/15',
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/25',
  },
  trail_running: {
    slug: 'trail_running',
    icon: Zap,
    label: 'Trail Running',
    bg: 'bg-rose-500/15',
    color: 'text-rose-400',
    ring: 'ring-rose-500/25',
  },
  climbing: {
    slug: 'climbing',
    icon: Mountain,
    label: 'Rock Climbing',
    bg: 'bg-violet-500/15',
    color: 'text-violet-400',
    ring: 'ring-violet-500/25',
  },
  road_cycling: {
    slug: 'road_cycling',
    icon: Bike,
    label: 'Road Cycling',
    bg: 'bg-blue-500/15',
    color: 'text-blue-400',
    ring: 'ring-blue-500/25',
  },
  camping: {
    slug: 'camping',
    icon: Tent,
    label: 'Camping',
    bg: 'bg-lime-500/15',
    color: 'text-lime-400',
    ring: 'ring-lime-500/25',
  },
  kayaking: {
    slug: 'kayaking',
    icon: Ship,
    label: 'Kayaking',
    bg: 'bg-cyan-500/15',
    color: 'text-cyan-400',
    ring: 'ring-cyan-500/25',
  },
  whitewater: {
    slug: 'whitewater',
    icon: Droplets,
    label: 'Whitewater Rafting',
    bg: 'bg-indigo-500/15',
    color: 'text-indigo-400',
    ring: 'ring-indigo-500/25',
  },
  standup_paddle: {
    slug: 'standup_paddle',
    icon: Waves,
    label: 'Paddleboard',
    bg: 'bg-teal-500/15',
    color: 'text-teal-400',
    ring: 'ring-teal-500/25',
  },
  skiing: {
    slug: 'skiing',
    icon: Snowflake,
    label: 'Skiing',
    bg: 'bg-sky-500/15',
    color: 'text-sky-400',
    ring: 'ring-sky-500/25',
  },
  snowboarding: {
    slug: 'snowboarding',
    icon: CloudSnow,
    label: 'Snowboarding',
    bg: 'bg-zinc-500/15',
    color: 'text-zinc-400',
    ring: 'ring-zinc-500/25',
  },
  fishing: {
    slug: 'fishing',
    icon: Fish,
    label: 'Fishing',
    bg: 'bg-orange-500/15',
    color: 'text-orange-400',
    ring: 'ring-orange-500/25',
  },
  backpacking: {
    slug: 'backpacking',
    icon: Compass,
    label: 'Backpacking',
    bg: 'bg-yellow-500/15',
    color: 'text-yellow-400',
    ring: 'ring-yellow-500/25',
  },
  surfing: {
    slug: 'surfing',
    icon: Wind,
    label: 'Surfing',
    bg: 'bg-fuchsia-500/15',
    color: 'text-fuchsia-400',
    ring: 'ring-fuchsia-500/25',
  },
  snowshoeing: {
    slug: 'snowshoeing',
    icon: TreePine,
    label: 'Snowshoeing',
    bg: 'bg-green-500/15',
    color: 'text-green-400',
    ring: 'ring-green-500/25',
  },
  sailing: {
    slug: 'sailing',
    icon: Anchor,
    label: 'Sailing',
    bg: 'bg-stone-500/15',
    color: 'text-stone-400',
    ring: 'ring-stone-500/25',
  },
  yoga: {
    slug: 'yoga',
    icon: Sunrise,
    label: 'Outdoor Yoga',
    bg: 'bg-pink-500/15',
    color: 'text-pink-400',
    ring: 'ring-pink-500/25',
  },
};

const SIZES = {
  xs: { container: 'h-5 w-5 rounded', icon: 'h-2.5 w-2.5' },
  sm: { container: 'h-7 w-7 rounded-md', icon: 'h-3.5 w-3.5' },
  md: { container: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
  lg: { container: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
  xl: { container: 'h-14 w-14 rounded-xl', icon: 'h-7 w-7' },
};

/** Primary activities shown by default */
export const PRIMARY_ACTIVITIES = [
  ACTIVITY_CONFIG.mtb,
  ACTIVITY_CONFIG.hiking,
  ACTIVITY_CONFIG.trail_running,
  ACTIVITY_CONFIG.climbing,
  ACTIVITY_CONFIG.road_cycling,
  ACTIVITY_CONFIG.camping,
  ACTIVITY_CONFIG.kayaking,
  ACTIVITY_CONFIG.whitewater,
  ACTIVITY_CONFIG.standup_paddle,
];

/** Additional activities shown in "More" section */
export const MORE_ACTIVITIES = [
  ACTIVITY_CONFIG.skiing,
  ACTIVITY_CONFIG.snowboarding,
  ACTIVITY_CONFIG.fishing,
  ACTIVITY_CONFIG.backpacking,
  ACTIVITY_CONFIG.surfing,
  ACTIVITY_CONFIG.snowshoeing,
  ACTIVITY_CONFIG.sailing,
  ACTIVITY_CONFIG.yoga,
];

/** All activities combined */
export const ACTIVITIES = [...PRIMARY_ACTIVITIES, ...MORE_ACTIVITIES];

/** Land-based activities */
export const LAND_ACTIVITIES = PRIMARY_ACTIVITIES.filter((a) =>
  ['mtb', 'hiking', 'trail_running', 'climbing', 'road_cycling', 'camping'].includes(a.slug),
);

/** Water-based activities */
export const WATER_ACTIVITIES = PRIMARY_ACTIVITIES.filter((a) =>
  ['kayaking', 'whitewater', 'standup_paddle'].includes(a.slug),
);

/** Winter/snow activities */
export const WINTER_ACTIVITIES = MORE_ACTIVITIES.filter((a) =>
  ['skiing', 'snowboarding', 'snowshoeing'].includes(a.slug),
);

export function getActivityLabel(slug: string): string {
  return ACTIVITY_CONFIG[slug]?.label ?? slug;
}

interface ActivityIconProps {
  activity: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export function ActivityIcon({ activity, size = 'md', className }: ActivityIconProps) {
  const config = ACTIVITY_CONFIG[activity];
  const sizeConfig = SIZES[size];

  if (!config) {
    return (
      <div
        className={clsx(
          'inline-flex items-center justify-center bg-gray-400/15 ring-1 ring-gray-400/25',
          sizeConfig.container,
          className,
        )}
      >
        <Target className={clsx('text-gray-500', sizeConfig.icon)} />
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center ring-1',
        config.bg,
        config.ring,
        sizeConfig.container,
        className,
      )}
    >
      <Icon className={clsx(config.color, sizeConfig.icon)} />
    </div>
  );
}
