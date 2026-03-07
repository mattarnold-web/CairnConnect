'use client';

import Link from 'next/link';
import { MapPin, Star, ArrowUpRight, Mountain, Ruler, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useFormat } from '@/lib/use-format';

const DIFFICULTY_COLORS: Record<string, string> = {
  green: '#10B981',
  blue: '#3B82F6',
  black: '#6B7280',
  double_black: '#111827',
  proline: '#7C3AED',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  green: 'Beginner',
  blue: 'Intermediate',
  black: 'Advanced',
  double_black: 'Expert',
  proline: 'Pro Line',
};

const CONDITION_CONFIG: Record<string, { color: string; label: string; dot: string }> = {
  open: { color: '#10B981', label: 'Open', dot: '🟢' },
  caution: { color: '#F59E0B', label: 'Caution', dot: '🟡' },
  closed: { color: '#EF4444', label: 'Closed', dot: '🔴' },
  unknown: { color: '#6B7280', label: 'Unknown', dot: '⚪' },
};

interface Trail {
  id: string;
  name: string;
  slug: string;
  difficulty: string;
  distance_meters: number;
  elevation_gain_meters: number;
  elevation_loss_meters?: number;
  estimated_duration_minutes?: number;
  trail_type: string;
  activity_types: string[];
  city: string | null;
  state_province: string | null;
  current_condition: string;
  rating: number;
  review_count: number;
  ride_count: number;
  description: string | null;
}

interface TrailCardProps {
  trail: Trail;
  compact?: boolean;
}

export function TrailCard({ trail, compact }: TrailCardProps) {
  const fmt = useFormat();
  const condition = CONDITION_CONFIG[trail.current_condition] || CONDITION_CONFIG.unknown;
  const diffColor = DIFFICULTY_COLORS[trail.difficulty] || '#6B7280';

  return (
    <Link href={`/trail/${trail.slug}`}>
      <Card className="group">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="difficulty" color={diffColor}>
                {DIFFICULTY_LABELS[trail.difficulty] || trail.difficulty}
              </Badge>
              <Badge variant="condition" color={condition.color}>
                {condition.dot} {condition.label}
              </Badge>
            </div>
            <h3 className="font-display text-base font-semibold text-gray-900 group-hover:text-canopy transition-colors line-clamp-1">
              {trail.name}
            </h3>
          </div>
          {trail.rating > 0 && (
            <div className="flex items-center gap-0.5 text-xs text-amber-400 shrink-0">
              <Star className="h-3 w-3 fill-current" />
              {trail.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            {fmt.distance(trail.distance_meters)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Mountain className="h-3 w-3" />
            {fmt.elevation(trail.elevation_gain_meters)} ↑
            {trail.elevation_loss_meters != null && (
              <> / {fmt.elevation(trail.elevation_loss_meters)} ↓</>
            )}
          </span>
          {trail.estimated_duration_minutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {fmt.duration(trail.estimated_duration_minutes)}
            </span>
          )}
          <span className="capitalize text-gray-400">
            {trail.trail_type.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Location */}
        {trail.city && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3" />
            {trail.city}{trail.state_province ? `, ${trail.state_province}` : ''}
          </div>
        )}

        {/* Description */}
        {!compact && trail.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{trail.description}</p>
        )}

        {/* Activity tags */}
        {trail.activity_types.length > 0 && (
          <div className="mt-2 flex gap-1">
            {trail.activity_types.map((at) => (
              <span
                key={at}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400 capitalize"
              >
                {at.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
