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
      {/* Post type badge + user */}
      <div className="flex items-center justify-between">
        <Badge variant="postType" color={config.color}>
          {config.icon} {config.label}
        </Badge>
        {post.user_display_name && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-cairn-elevated flex items-center justify-center text-[10px] font-bold text-slate-400">
              {post.user_display_name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-xs text-slate-400">{post.user_display_name}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-base font-semibold text-slate-100">
        {post.title}
      </h3>

      {/* Info row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
        {post.location_name && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {post.location_name}
            {post.distance_km != null && (
              <span className="text-slate-500">· {post.distance_km.toFixed(0)}km</span>
            )}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(post.activity_date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Zap className="h-3 w-3" style={{ color: SKILL_COLORS[post.skill_level] }} />
          <span className="capitalize">{post.skill_level}</span>
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3 text-xs">
          <span className={`inline-flex items-center gap-1 ${isFull ? 'text-red-400' : 'text-canopy'}`}>
            <Users className="h-3 w-3" />
            {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
          </span>
          {post.cost_share != null && post.cost_share > 0 && (
            <span className="inline-flex items-center gap-1 text-slate-400">
              <DollarSign className="h-3 w-3" />
              ${post.cost_share}
            </span>
          )}
          {post.permit_required && (
            <span className="inline-flex items-center gap-1 text-spotlight-gold">
              <Ticket className="h-3 w-3" />
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
