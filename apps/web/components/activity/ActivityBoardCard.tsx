'use client';

import { MapPin, Calendar, Zap, Users, DollarSign, Ticket } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const POST_TYPE_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  im_going: { color: '#10B981', label: "I'M GOING", icon: '🟢' },
  open_permit: { color: '#F59E0B', label: 'OPEN PERMIT', icon: '🎫' },
  lfg: { color: '#8B5CF6', label: 'LFG', icon: '🟣' },
};

const SKILL_COLORS: Record<string, string> = {
  beginner: '#10B981',
  intermediate: '#3B82F6',
  advanced: '#F59E0B',
  expert: '#EF4444',
};

interface ActivityPostProps {
  post: {
    id: string;
    post_type: string;
    activity_type: string;
    title: string;
    description: string | null;
    location_name: string | null;
    activity_date: string;
    skill_level: string;
    max_participants: number;
    current_participants: number;
    permit_required: boolean;
    permit_type: string | null;
    cost_share: number | null;
    user_display_name?: string;
    distance_km?: number;
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityBoardCard({ post }: ActivityPostProps) {
  const config = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.im_going;
  const spotsLeft = post.max_participants - post.current_participants;
  const isFull = spotsLeft <= 0;

  return (
    <Card className="space-y-3">
      {/* Header: user + post type */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {post.user_display_name && (
            <>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                {post.user_display_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">{post.user_display_name}</span>
                <div className="text-xs text-gray-400">{formatDate(post.activity_date)}</div>
              </div>
            </>
          )}
        </div>
        <Badge variant="postType" color={config.color}>
          {config.label}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="font-display text-base font-semibold text-gray-900">
        {post.title}
      </h3>

      {/* Stats row - Strava-style inline metrics */}
      <div className="flex items-center gap-4 py-2 border-t border-b border-gray-100 text-xs text-gray-500">
        {post.location_name && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium text-gray-700">{post.location_name}</span>
            {post.distance_km != null && (
              <span className="text-gray-400">· {post.distance_km.toFixed(0)}km</span>
            )}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Zap className="h-3.5 w-3.5" style={{ color: SKILL_COLORS[post.skill_level] }} />
          <span className="capitalize font-medium">{post.skill_level}</span>
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className={`inline-flex items-center gap-1 font-medium ${isFull ? 'text-red-500' : 'text-canopy'}`}>
            <Users className="h-3.5 w-3.5" />
            {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
          </span>
          {post.cost_share != null && post.cost_share > 0 && (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <DollarSign className="h-3.5 w-3.5" />
              ${post.cost_share}
            </span>
          )}
          {post.permit_required && (
            <span className="inline-flex items-center gap-1 text-spotlight-gold font-medium">
              <Ticket className="h-3.5 w-3.5" />
              Permit included
            </span>
          )}
        </div>
        <Button size="sm" variant={isFull ? 'ghost' : 'primary'} disabled={isFull}>
          {isFull ? 'Full' : 'Join'}
        </Button>
      </div>
    </Card>
  );
}
