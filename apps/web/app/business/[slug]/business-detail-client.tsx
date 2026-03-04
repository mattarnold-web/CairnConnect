'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Star,
  Globe,
  MapPin,
  Phone,
  Calendar,
  Camera,
  Clock,
  Mail,
  MessageCircle,
  Users as UsersIcon,
  Play,
  Award,
  ThumbsUp,
  Activity,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { SpotlightBadge } from '@/components/ui/SpotlightBadge';
import { TrailCard } from '@/components/trail/TrailCard';
import { AddToTripButton } from '@/components/trip/AddToTripButton';
import { toggleSavedItem } from '@/lib/actions/saved-items';
import type { DbBusiness, DbTrail } from '@/lib/database-types';
import type { ReviewWithAuthor } from '@/lib/queries/reviews';

const CATEGORY_ICONS: Record<string, string> = {
  bike_shop: '\u{1F6B2}',
  gear_rental: '\u{1F392}',
  guide_service: '\u{1F9ED}',
  outfitter: '\u{1F3D5}\uFE0F',
  outdoor_gear_shop: '\u{1F6D2}',
  bike_shuttle: '\u{1F690}',
  mountain_hut: '\u{1F3D4}\uFE0F',
  kayak_sup: '\u{1F6F6}',
  surf_school: '\u{1F3C4}',
  adventure_hostel: '\u{1F3E0}',
  camping: '\u26FA',
  trailhead_cafe: '\u2615',
  outdoor_club: '\u{1F91D}',
};

const CATEGORY_LABELS: Record<string, string> = {
  bike_shop: 'Bike Shop',
  gear_rental: 'Gear Rental',
  guide_service: 'Guide Service',
  outfitter: 'Outfitter',
  outdoor_gear_shop: 'Outdoor Gear',
  bike_shuttle: 'Shuttle',
  mountain_hut: 'Mountain Hut',
  kayak_sup: 'Kayak & SUP',
  surf_school: 'Surf School',
  adventure_hostel: 'Hostel',
  camping: 'Camping',
  trailhead_cafe: 'Cafe',
  outdoor_club: 'Club',
};

function getTodayKey(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
    />
  ));
}

interface BusinessDetailClientProps {
  business: DbBusiness;
  reviews: ReviewWithAuthor[];
  nearbyTrails: DbTrail[];
  isSaved?: boolean;
}

export function BusinessDetailClient({ business, reviews, nearbyTrails, isSaved: initialSaved = false }: BusinessDetailClientProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const categoryIcon = CATEGORY_ICONS[business.category] || '\u{1F4CD}';
  const categoryLabel = CATEGORY_LABELS[business.category] || business.category;
  const todayHours = business.hours
    ? (business.hours as Record<string, string>)[getTodayKey()] ?? null
    : null;

  const biz = business as any;
  const linkItems = [
    { label: 'Website', icon: Globe, href: business.website_url },
    { label: 'Directions', icon: MapPin, href: business.google_maps_url },
    { label: 'Call', icon: Phone, href: business.phone ? `tel:${business.phone}` : null },
    { label: 'Email', icon: Mail, href: business.email ? `mailto:${business.email}` : null },
    { label: 'Book', icon: Calendar, href: business.booking_url },
    { label: 'Instagram', icon: Camera, href: business.instagram_handle ? `https://instagram.com/${business.instagram_handle}` : null },
    { label: 'Facebook', icon: UsersIcon, href: biz.facebook_url || null },
    { label: 'WhatsApp', icon: MessageCircle, href: biz.whatsapp ? `https://wa.me/${biz.whatsapp.replace(/[^0-9]/g, '')}` : null },
    { label: 'YouTube', icon: Play, href: biz.youtube_url || null },
    { label: 'TripAdvisor', icon: Award, href: biz.tripadvisor_url || null },
    { label: 'Yelp', icon: ThumbsUp, href: biz.yelp_url || null },
    { label: 'Strava', icon: Activity, href: biz.strava_segment_url || null },
  ].filter((item) => item.href);

  return (
    <div className="min-h-screen bg-cairn-bg pb-24">
      <Navbar />

      {/* Cover area */}
      <div className="relative h-[300px] bg-gradient-to-br from-cairn-elevated via-cairn-card to-cairn-bg">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl opacity-20 select-none">{categoryIcon}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 gradient-overlay" />
        <div className="absolute top-20 left-4 sm:left-6">
          <Link
            href="/explore"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cairn-bg/60 backdrop-blur-sm border border-cairn-border text-slate-300 hover:bg-cairn-card hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="absolute top-20 right-4 sm:right-6 flex items-center gap-2">
          {business.is_spotlight && (
            <SpotlightBadge tier={business.spotlight_tier} size="md" />
          )}
          <button
            onClick={() => {
              startTransition(async () => {
                const result = await toggleSavedItem('business', business.id);
                if ('saved' in result) setIsSaved(!!result.saved);
              });
            }}
            disabled={isPending}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cairn-bg/60 backdrop-blur-sm border border-cairn-border text-slate-300 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-400 text-red-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-8 relative z-10">
        <h1 className="font-display text-2xl font-bold text-slate-100">{business.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span>{categoryIcon}</span>
            {categoryLabel}
          </span>
          <span className="text-cairn-border">|</span>
          {business.rating > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              {business.rating.toFixed(1)}
              <span className="text-slate-500">({business.review_count} reviews)</span>
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-canopy" />
          {todayHours ? (
            <span className="text-slate-300">
              <span className="font-semibold text-canopy">Open</span>
              {' \u00B7 '}
              {todayHours}
            </span>
          ) : (
            <span className="text-slate-500">Hours unavailable</span>
          )}
        </div>

        {business.special_offer && (
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 text-sm text-amber-300">
            <span className="font-semibold text-amber-400">Special Offer: </span>
            {business.special_offer}
          </div>
        )}

        {/* Link bar */}
        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {linkItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-cairn-card border border-cairn-border px-4 py-3 min-w-[80px] text-xs text-slate-300 hover:bg-cairn-card-hover hover:text-white transition-colors shrink-0"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </a>
            );
          })}
        </div>

        {/* About */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">About</h2>
          {business.description ? (
            <p className="text-sm leading-relaxed text-slate-400">{business.description}</p>
          ) : (
            <p className="text-sm text-slate-500 italic">No description available.</p>
          )}
        </section>

        {/* Location */}
        {(business.address || business.city) && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">Location</h2>
            <div className="flex items-start gap-2 text-sm text-slate-400">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-canopy" />
              <span>
                {business.address}
                {business.city ? `, ${business.city}` : ''}
                {business.state_province ? `, ${business.state_province}` : ''}
              </span>
            </div>
          </section>
        )}

        {/* Trails Nearby */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">Trails Nearby</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyTrails.map((trail) => (
              <TrailCard key={trail.id} trail={trail as any} compact />
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-cairn-border bg-cairn-card p-4">
                  <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  <h3 className="mt-2 font-display text-sm font-semibold text-slate-100">{review.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{review.body}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-300">{review.author_name ?? 'Anonymous'}</span>
                    <span>{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No reviews yet. Be the first to share your experience!</p>
          )}
        </section>

        {/* Tags */}
        {business.tags.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {business.tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-cairn-elevated/50 border border-cairn-border px-3 py-1 text-xs text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <AddToTripButton
        customTitle={business.name}
        activityType={business.activity_types?.[0] || undefined}
      />
    </div>
  );
}
