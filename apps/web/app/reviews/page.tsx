'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Pencil, Mountain, Camera } from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/components/layout/Navbar';

const FILTER_TABS = ['Recent', 'Highest Rated', 'Photos Only', 'Video'] as const;

interface Review {
  id: string;
  username: string;
  avatarInitial: string;
  stars: number;
  date: string;
  text: string;
  photoCount: number;
  helpfulVotes: number;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    username: 'User E',
    avatarInitial: 'E',
    stars: 5,
    date: 'Yesterday',
    text: 'Stunning waterfalls! Trail was muddy but manageable. Bring trekking poles.',
    photoCount: 4,
    helpfulVotes: 42,
  },
  {
    id: '2',
    username: 'User F',
    avatarInitial: 'F',
    stars: 3,
    date: '2 days ago',
    text: 'Great hike, but very crowded on weekends. Beautiful views.',
    photoCount: 3,
    helpfulVotes: 15,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={clsx(
            'h-4 w-4',
            i < count ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [votes, setVotes] = useState(review.helpfulVotes);
  const [voted, setVoted] = useState(false);

  function handleVote() {
    if (voted) {
      setVotes(votes - 1);
      setVoted(false);
    } else {
      setVotes(votes + 1);
      setVoted(true);
    }
  }

  return (
    <div className="rounded-2xl bg-cairn-card border border-cairn-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-cairn-elevated border border-cairn-border flex items-center justify-center text-sm font-bold text-[var(--text-primary)]">
          {review.avatarInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {review.username}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating count={review.stars} />
            <span className="text-xs text-[var(--text-tertiary)]">{review.date}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {review.text}
      </p>

      {/* Photo thumbnails */}
      <div className="flex items-center gap-2">
        {Array.from({ length: review.photoCount }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-16 rounded-lg bg-cairn-elevated border border-cairn-border flex items-center justify-center"
          >
            <Mountain className="h-5 w-5 text-[var(--text-tertiary)]" />
          </div>
        ))}
      </div>

      {/* Helpful button */}
      <button
        onClick={handleVote}
        className={clsx(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
          voted
            ? 'bg-canopy/15 text-canopy border border-canopy/30'
            : 'bg-cairn-elevated border border-cairn-border text-[var(--text-secondary)] hover:bg-cairn-card-hover'
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        Helpful ({votes} votes)
      </button>
    </div>
  );
}

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<string>('Recent');

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Eagle Creek Trail
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-[var(--text-secondary)]">
              Overall Rating: <span className="font-semibold text-[var(--text-primary)]">4.7</span>{' '}
              (1,284 reviews)
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab
                  ? 'bg-canopy/15 text-canopy border-b-2 border-canopy'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-cairn-card'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Review Cards */}
        <div className="space-y-4">
          {MOCK_REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Photo Upload Section */}
        <div className="mt-8 rounded-2xl bg-cairn-card border border-cairn-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Photo Upload
            </h2>
            <button className="flex items-center gap-2 rounded-xl bg-canopy px-4 py-2 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors">
              <Camera className="h-4 w-4" />
              Add Photos
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-cairn-elevated border border-cairn-border flex items-center justify-center"
              >
                <Mountain className="h-6 w-6 text-[var(--text-tertiary)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 flex items-center gap-3">
        <span className="rounded-lg bg-cairn-card border border-cairn-border px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] shadow-lg">
          Write Review
        </span>
        <button className="h-14 w-14 rounded-full bg-canopy hover:bg-canopy-dark transition-colors shadow-lg shadow-canopy/30 flex items-center justify-center">
          <Pencil className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}
