'use client';

import Link from 'next/link';
import { MapPin, Star, Clock, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SpotlightBadge } from '../ui/SpotlightBadge';

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  activity_types: string[];
  city: string | null;
  state_province: string | null;
  rating: number;
  review_count: number;
  is_spotlight: boolean;
  spotlight_tier: string | null;
  special_offer: string | null;
  cover_photo_url: string | null;
  tags: string[];
  description: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  bike_shop: '🚲',
  gear_rental: '🎒',
  guide_service: '🧭',
  outfitter: '🏕️',
  outdoor_gear_shop: '🛒',
  bike_shuttle: '🚐',
  mountain_hut: '🏔️',
  kayak_sup: '🛶',
  surf_school: '🏄',
  adventure_hostel: '🏠',
  camping: '⛺',
  trailhead_cafe: '☕',
  outdoor_club: '🤝',
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

interface BusinessCardProps {
  business: Business;
  compact?: boolean;
}

export function BusinessCard({ business, compact }: BusinessCardProps) {
  return (
    <Link href={`/business/${business.slug}`}>
      <Card spotlight={business.is_spotlight} className="group">
        {/* Cover image area */}
        <div className="relative -mx-4 -mt-4 mb-3 h-40 rounded-t-2xl overflow-hidden bg-gradient-to-br from-cairn-elevated to-cairn-bg">
          <div className="absolute inset-0 bg-gradient-to-br from-canopy/20 via-transparent to-cairn-bg/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-30">
              {CATEGORY_ICONS[business.category] || '📍'}
            </span>
          </div>
          {/* Spotlight badge */}
          {business.is_spotlight && (
            <div className="absolute top-3 right-3">
              <SpotlightBadge tier={business.spotlight_tier} />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16 gradient-overlay" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-slate-100 group-hover:text-canopy transition-colors line-clamp-1">
              {business.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              {CATEGORY_ICONS[business.category]}{' '}
              {CATEGORY_LABELS[business.category] || business.category}
            </span>
            <span className="text-cairn-border">·</span>
            {business.rating > 0 && (
              <span className="inline-flex items-center gap-0.5 text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                {business.rating.toFixed(1)}
                <span className="text-slate-500">({business.review_count})</span>
              </span>
            )}
          </div>

          {business.city && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {business.city}{business.state_province ? `, ${business.state_province}` : ''}
            </div>
          )}

          {!compact && business.description && (
            <p className="text-sm text-slate-400 line-clamp-2">{business.description}</p>
          )}

          {/* Special offer */}
          {business.special_offer && (
            <div className="mt-2 rounded-lg bg-spotlight-gold/10 border border-spotlight-gold/20 px-3 py-1.5 text-xs text-spotlight-gold">
              {business.special_offer}
            </div>
          )}

          {/* Tags */}
          {!compact && business.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {business.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cairn-elevated/50 px-2 py-0.5 text-[10px] text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
