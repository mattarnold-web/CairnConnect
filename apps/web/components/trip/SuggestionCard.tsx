'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SpotlightBadge } from '@/components/ui/SpotlightBadge';
import { TripSuggestion } from '@/lib/trip-suggestions';
import { MOCK_BUSINESSES } from '@/lib/mock-data';

const UNIT_LABELS: Record<string, string> = {
  per_person: '/pp',
  per_group: '/group',
  flat: '',
};

interface SuggestionCardProps {
  suggestion: TripSuggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const business = suggestion.businessSlug
    ? MOCK_BUSINESSES.find((b) => b.slug === suggestion.businessSlug)
    : null;
  const priceRange = business ? (business as any).price_range : null;

  const content = (
    <Card
      spotlight={suggestion.isSpotlight}
      hover={!!suggestion.businessSlug}
      className="p-3"
    >
      <div className="flex items-start gap-3">
        {/* Emoji */}
        <span className="text-2xl leading-none shrink-0">{suggestion.emoji}</span>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 truncate">
              {suggestion.title}
            </span>
            {suggestion.isSpotlight && <SpotlightBadge size="sm" />}
          </div>
          <p className="text-xs text-gray-400 truncate">{suggestion.subtitle}</p>
          <p className="text-xs text-gray-500 italic mt-1">{suggestion.reason}</p>

          {/* Price + Book row */}
          {priceRange && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-medium text-canopy">
                ${priceRange.min}–${priceRange.max}
                <span className="text-gray-400">{UNIT_LABELS[priceRange.unit] || ''}</span>
              </span>
              {business?.booking_url && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(business.booking_url, '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-canopy hover:text-canopy-dark transition-colors"
                >
                  Book <ExternalLink className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Special offer banner */}
      {suggestion.specialOffer && (
        <div className="mt-2 rounded-lg bg-spotlight-gold/10 border border-spotlight-gold/20 px-3 py-1.5 text-spotlight-gold text-xs">
          {suggestion.specialOffer}
        </div>
      )}
    </Card>
  );

  if (suggestion.businessSlug) {
    return (
      <Link href={`/business/${suggestion.businessSlug}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
