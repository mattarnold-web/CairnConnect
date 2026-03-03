'use client';

import { useState, useMemo } from 'react';
import { Users, Plus } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ActivityBoardCard } from '@/components/activity/ActivityBoardCard';
import { FilterChip } from '@/components/ui/FilterChip';
import { Button } from '@/components/ui/Button';
import { MOCK_ACTIVITY_POSTS } from '@/lib/mock-data';

const POST_TYPE_FILTERS = [
  { label: 'All', value: null },
  { label: "I'm Going", value: 'im_going', color: '#10B981' },
  { label: 'Open Permit', value: 'open_permit', color: '#F59E0B' },
  { label: 'LFG', value: 'lfg', color: '#8B5CF6' },
] as const;

const ACTIVITY_FILTERS = [
  { label: 'All', value: null, emoji: undefined },
  { label: 'MTB', value: 'mtb', emoji: undefined },
  { label: 'Hiking', value: 'hiking', emoji: undefined },
  { label: 'Climbing', value: 'climbing', emoji: undefined },
  { label: 'Kayaking', value: 'kayaking', emoji: undefined },
  { label: 'Trail Running', value: 'trail_running', emoji: undefined },
] as const;

const SKILL_FILTERS = [
  { label: 'All', value: null },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
] as const;

export default function ActivityBoardPage() {
  const [selectedPostType, setSelectedPostType] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    let posts = MOCK_ACTIVITY_POSTS.filter((post) => {
      if (selectedPostType && post.post_type !== selectedPostType) return false;
      if (selectedActivity && post.activity_type !== selectedActivity) return false;
      if (selectedSkill && post.skill_level !== selectedSkill) return false;
      return true;
    });

    // Sort open_permit posts to the top
    posts = [...posts].sort((a, b) => {
      if (a.post_type === 'open_permit' && b.post_type !== 'open_permit') return -1;
      if (a.post_type !== 'open_permit' && b.post_type === 'open_permit') return 1;
      return 0;
    });

    return posts;
  }, [selectedPostType, selectedActivity, selectedSkill]);

  return (
    <div className="min-h-screen bg-cairn-bg">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-24">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-6 w-6 text-canopy" />
              <h1 className="font-display text-2xl font-bold text-slate-100">
                Activity Board
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Find adventure partners, share permits, and join activities near you
            </p>
          </div>
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>

        {/* Filter section */}
        <div className="space-y-3 mb-6">
          {/* Post type filters */}
          <div className="flex flex-wrap gap-2">
            {POST_TYPE_FILTERS.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setSelectedPostType(filter.value ?? null)}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200 border"
                style={
                  selectedPostType === filter.value
                    ? {
                        backgroundColor: filter.value
                          ? `${(filter as { color?: string }).color}15`
                          : 'rgba(16, 185, 129, 0.15)',
                        borderColor: filter.value
                          ? `${(filter as { color?: string }).color}50`
                          : 'rgb(16, 185, 129)',
                        color: filter.value
                          ? (filter as { color?: string }).color
                          : 'rgb(16, 185, 129)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: 'rgb(30, 58, 95)',
                        color: 'rgb(148, 163, 184)',
                      }
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Activity type filters */}
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_FILTERS.map((filter) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                emoji={filter.emoji}
                active={selectedActivity === filter.value}
                onClick={() => setSelectedActivity(filter.value ?? null)}
              />
            ))}
          </div>

          {/* Skill level filters */}
          <div className="flex flex-wrap gap-2">
            {SKILL_FILTERS.map((filter) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                active={selectedSkill === filter.value}
                onClick={() => setSelectedSkill(filter.value ?? null)}
              />
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-500 mb-4">
          Showing {filteredPosts.length} activit{filteredPosts.length === 1 ? 'y' : 'ies'}
        </p>

        {/* Post feed */}
        {filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <ActivityBoardCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-12 text-center">
            <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-display text-lg font-semibold text-slate-300 mb-1">
              No activities match your filters
            </h3>
            <p className="text-sm text-slate-500">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
