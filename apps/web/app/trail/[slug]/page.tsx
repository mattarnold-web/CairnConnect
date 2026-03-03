'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Star,
  Ruler,
  Mountain,
  MapPin,
  ArrowUpDown,
  Activity,
  AlertTriangle,
  Clock,
  TrendingDown,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Badge } from '@/components/ui/Badge';
import { BusinessCard } from '@/components/business/BusinessCard';
import { AddToTripButton } from '@/components/trip/AddToTripButton';
import { useFormat } from '@/lib/use-format';
import { MOCK_TRAILS, MOCK_BUSINESSES, MOCK_REVIEWS } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

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

const CONDITION_CONFIG: Record<
  string,
  { color: string; label: string; dot: string }
> = {
  open: { color: '#10B981', label: 'Open', dot: '\u{1F7E2}' },
  caution: { color: '#F59E0B', label: 'Caution', dot: '\u{1F7E1}' },
  closed: { color: '#EF4444', label: 'Closed', dot: '\u{1F534}' },
  unknown: { color: '#6B7280', label: 'Unknown', dot: '\u26AA' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${
        i < Math.round(rating)
          ? 'text-amber-400 fill-amber-400'
          : 'text-slate-600'
      }`}
    />
  ));
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TrailDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const fmt = useFormat();

  const trail = MOCK_TRAILS.find((t) => t.slug === slug);

  if (!trail) {
    return (
      <div className="min-h-screen bg-cairn-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-4 pt-32 text-center">
          <h1 className="font-display text-2xl font-bold text-slate-100">
            Trail not found
          </h1>
          <p className="text-slate-400">
            We could not find a trail matching that URL.
          </p>
          <Link
            href="/explore"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-canopy px-5 py-2.5 text-sm font-semibold text-white hover:bg-canopy-dark transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const diffColor = DIFFICULTY_COLORS[trail.difficulty] || '#6B7280';
  const diffLabel = DIFFICULTY_LABELS[trail.difficulty] || trail.difficulty;
  const condition =
    CONDITION_CONFIG[trail.current_condition] || CONDITION_CONFIG.unknown;

  const reviews = MOCK_REVIEWS.filter(
    (r) => r.entity_type === 'trail' && r.entity_id === trail.id,
  );
  const nearbyBusinesses = MOCK_BUSINESSES.slice(0, 3);

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />

      {/* Header area */}
      <div className="relative h-[260px] bg-gradient-to-br from-canopy/20 via-cairn-elevated to-cairn-bg">
        {/* Decorative mountain silhouette */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg
            viewBox="0 0 800 260"
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 260 L100 180 L200 200 L300 120 L400 160 L500 80 L600 140 L700 100 L800 160 L800 260 Z"
              fill="currentColor"
              className="text-canopy"
            />
          </svg>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 gradient-overlay" />

        {/* Back button */}
        <div className="absolute top-20 left-4 sm:left-6">
          <Link
            href="/explore"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cairn-bg/60 backdrop-blur-sm border border-cairn-border text-slate-300 hover:bg-cairn-card hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {/* Save button */}
        <div className="absolute top-20 right-4 sm:right-6">
          <button className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cairn-bg/60 backdrop-blur-sm border border-cairn-border text-slate-300 hover:text-red-400 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Trail name + badges pinned above gradient */}
        <div className="absolute bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="difficulty" color={diffColor}>
              {diffLabel}
            </Badge>
            <Badge variant="condition" color={condition.color}>
              {condition.dot} {condition.label}
            </Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100">
            {trail.name}
          </h1>
          {trail.city && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
              {trail.city}
              {trail.state_province ? `, ${trail.state_province}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 mt-6">
        {/* ---- Stats grid ---- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Distance */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex flex-col items-center gap-1.5 text-center">
            <Ruler className="h-5 w-5 text-canopy" />
            <span className="font-display text-lg font-bold text-slate-100">
              {fmt.distance(trail.distance_meters)}
            </span>
            <span className="text-xs text-slate-500">Distance</span>
          </div>

          {/* Elevation Gain */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex flex-col items-center gap-1.5 text-center">
            <Mountain className="h-5 w-5 text-canopy" />
            <span className="font-display text-lg font-bold text-slate-100">
              {fmt.elevation(trail.elevation_gain_meters)}
            </span>
            <span className="text-xs text-slate-500">Elevation Gain</span>
          </div>

          {/* Descent */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex flex-col items-center gap-1.5 text-center">
            <TrendingDown className="h-5 w-5 text-canopy" />
            <span className="font-display text-lg font-bold text-slate-100">
              {fmt.elevation(trail.elevation_loss_meters)}
            </span>
            <span className="text-xs text-slate-500">Descent</span>
          </div>

          {/* Est. Time */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex flex-col items-center gap-1.5 text-center">
            <Clock className="h-5 w-5 text-canopy" />
            <span className="font-display text-lg font-bold text-slate-100">
              {fmt.duration(trail.estimated_duration_minutes)}
            </span>
            <span className="text-xs text-slate-500">Est. Time</span>
          </div>

          {/* Trail Type */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex flex-col items-center gap-1.5 text-center">
            <ArrowUpDown className="h-5 w-5 text-canopy" />
            <span className="font-display text-lg font-bold text-slate-100 capitalize">
              {trail.trail_type.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-slate-500">Trail Type</span>
          </div>

          {/* Rating */}
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 flex flex-col items-center gap-1.5 text-center">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <span className="font-display text-lg font-bold text-slate-100">
              {trail.rating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">
              {trail.review_count.toLocaleString()} reviews
            </span>
          </div>
        </div>

        {/* ---- Description ---- */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
            Description
          </h2>
          {trail.description ? (
            <p className="text-sm leading-relaxed text-slate-400">
              {trail.description}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">
              No description available.
            </p>
          )}
        </section>

        {/* ---- Elevation Profile (decorative) ---- */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
            Elevation Profile
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4 overflow-hidden">
            <svg
              viewBox="0 0 600 150"
              className="w-full h-32"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[30, 60, 90, 120].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="currentColor"
                  className="text-cairn-border"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              ))}
              {/* Elevation curve fill */}
              <path
                d="M0 140 C30 130, 60 110, 100 95 C140 80, 160 85, 200 70 C240 55, 260 40, 300 35 C340 30, 360 45, 400 55 C440 65, 460 50, 500 45 C540 40, 570 60, 600 80 L600 150 L0 150 Z"
                fill="url(#elevGradient)"
              />
              {/* Elevation curve line */}
              <path
                d="M0 140 C30 130, 60 110, 100 95 C140 80, 160 85, 200 70 C240 55, 260 40, 300 35 C340 30, 360 45, 400 55 C440 65, 460 50, 500 45 C540 40, 570 60, 600 80"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="elevGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
              <span>Start</span>
              <span>
                {trail.min_elevation_meters != null &&
                  trail.max_elevation_meters != null &&
                  `${fmt.elevation(trail.min_elevation_meters)} \u2013 ${fmt.elevation(trail.max_elevation_meters)}`}
              </span>
              <span>End</span>
            </div>
          </div>
        </section>

        {/* ---- Trail Conditions ---- */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
            Trail Conditions
          </h2>
          <div className="rounded-2xl border border-cairn-border bg-cairn-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{condition.dot}</span>
                <div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: condition.color }}
                  >
                    {condition.label}
                  </span>
                  {trail.condition_updated_at && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      <Clock className="inline h-3 w-3 mr-1 -mt-0.5" />
                      Updated{' '}
                      {new Date(trail.condition_updated_at).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </p>
                  )}
                </div>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-xl bg-cairn-elevated border border-cairn-border px-3 py-2 text-xs font-medium text-slate-300 hover:bg-cairn-card-hover hover:text-white transition-colors">
                <AlertTriangle className="h-3.5 w-3.5" />
                Report a Condition
              </button>
            </div>
          </div>
        </section>

        {/* ---- Reviews ---- */}
        {reviews.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
              Reviews
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-cairn-border bg-cairn-card p-4"
                >
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <h3 className="mt-2 font-display text-sm font-semibold text-slate-100">
                    {review.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {review.body}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-300">
                      {review.author_name}
                    </span>
                    <span>
                      {new Date(review.created_at).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' },
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- Nearby Businesses ---- */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
            Nearby Businesses
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyBusinesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} compact />
            ))}
          </div>
        </section>

        {/* ---- Activity types tags ---- */}
        {trail.activity_types.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
              Activities
            </h2>
            <div className="flex flex-wrap gap-2">
              {trail.activity_types.map((at: string) => (
                <span
                  key={at}
                  className="rounded-full bg-cairn-elevated/50 border border-cairn-border px-3 py-1 text-xs text-slate-400 capitalize"
                >
                  {at.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ---- Best seasons ---- */}
        {trail.best_seasons.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
              Best Seasons
            </h2>
            <div className="flex flex-wrap gap-2">
              {trail.best_seasons.map((s: string) => (
                <span
                  key={s}
                  className="rounded-full bg-canopy/10 border border-canopy/20 px-3 py-1 text-xs text-canopy capitalize"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <AddToTripButton trailId={trail.id} trailName={trail.name} />
    </div>
  );
}
