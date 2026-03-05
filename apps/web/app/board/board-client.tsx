'use client';

import { useState, useMemo, useTransition } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ActivityBoardCard } from '@/components/activity/ActivityBoardCard';
import { FilterChip } from '@/components/ui/FilterChip';
import { Button } from '@/components/ui/Button';
import { createActivityPost, type CreateActivityPostInput } from '@/lib/actions/activity-posts';
import type { ActivityPostWithAuthor } from '@/lib/queries/activity-posts';

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

interface BoardClientProps {
  posts: ActivityPostWithAuthor[];
}

export function BoardClient({ posts }: BoardClientProps) {
  const [selectedPostType, setSelectedPostType] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter((post) => {
      if (selectedPostType && post.post_type !== selectedPostType) return false;
      if (selectedActivity && post.activity_type !== selectedActivity) return false;
      if (selectedSkill && post.skill_level !== selectedSkill) return false;
      return true;
    });

    // Sort open_permit posts to the top
    filtered = [...filtered].sort((a, b) => {
      if (a.post_type === 'open_permit' && b.post_type !== 'open_permit') return -1;
      if (a.post_type !== 'open_permit' && b.post_type === 'open_permit') return 1;
      return 0;
    });

    return filtered;
  }, [posts, selectedPostType, selectedActivity, selectedSkill]);

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
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>

        {/* Filter section */}
        <div className="space-y-3 mb-6">
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

        <p className="text-xs text-slate-500 mb-4">
          Showing {filteredPosts.length} activit{filteredPosts.length === 1 ? 'y' : 'ies'}
        </p>

        {filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <ActivityBoardCard key={post.id} post={post as any} />
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

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          isPending={isPending}
          error={formError}
          onClose={() => {
            setShowCreateModal(false);
            setFormError(null);
          }}
          onSubmit={(input) => {
            setFormError(null);
            startTransition(async () => {
              const result = await createActivityPost(input);
              if ('error' in result && result.error) {
                setFormError(result.error);
              } else {
                setShowCreateModal(false);
              }
            });
          }}
        />
      )}
    </div>
  );
}

function CreatePostModal({
  isPending,
  error,
  onClose,
  onSubmit,
}: {
  isPending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: CreateActivityPostInput) => void;
}) {
  const [postType, setPostType] = useState<'im_going' | 'open_permit' | 'lfg'>('im_going');
  const [activityType, setActivityType] = useState('mtb');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [maxParticipants, setMaxParticipants] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !activityDate) return;
    onSubmit({
      postType,
      activityType,
      title: title.trim(),
      description: description.trim() || undefined,
      locationName: locationName.trim() || undefined,
      activityDate,
      skillLevel,
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-cairn-card border border-cairn-border p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-slate-100">Create Activity Post</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Type */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Post Type</label>
            <div className="flex gap-2">
              {([
                { value: 'im_going', label: "I'm Going", color: '#10B981' },
                { value: 'open_permit', label: 'Open Permit', color: '#F59E0B' },
                { value: 'lfg', label: 'LFG', color: '#8B5CF6' },
              ] as const).map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setPostType(pt.value)}
                  className="flex-1 rounded-lg border py-2 text-xs font-medium transition-colors"
                  style={
                    postType === pt.value
                      ? { backgroundColor: `${pt.color}15`, borderColor: `${pt.color}50`, color: pt.color }
                      : { backgroundColor: 'transparent', borderColor: 'rgb(30, 58, 95)', color: 'rgb(148, 163, 184)' }
                  }
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Activity</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 focus:border-canopy focus:outline-none"
            >
              <option value="mtb">Mountain Biking</option>
              <option value="hiking">Hiking</option>
              <option value="climbing">Climbing</option>
              <option value="kayaking">Kayaking</option>
              <option value="trail_running">Trail Running</option>
              <option value="skiing">Skiing</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning ride on Whole Enchilada"
              required
              className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-canopy focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people about the plan..."
              rows={3}
              className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-canopy focus:outline-none resize-none"
            />
          </div>

          {/* Location & Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Location</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Moab, UT"
                className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-canopy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Date *</label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                required
                className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 focus:border-canopy focus:outline-none"
              />
            </div>
          </div>

          {/* Skill & Participants row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Skill Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as any)}
                className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 focus:border-canopy focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Max Participants</label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="No limit"
                min="2"
                className="w-full rounded-lg bg-cairn-elevated border border-cairn-border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-canopy focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending || !title.trim() || !activityDate}
              className="flex-1 rounded-xl bg-canopy py-2.5 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors disabled:opacity-40"
            >
              {isPending ? 'Creating...' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
