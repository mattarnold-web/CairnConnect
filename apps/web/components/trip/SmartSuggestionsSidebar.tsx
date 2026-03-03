'use client';

import { useMemo } from 'react';
import { Compass } from 'lucide-react';
import { generateSuggestions, SUGGESTION_CATEGORY_ORDER, SUGGESTION_CATEGORY_LABELS } from '@/lib/trip-suggestions';
import type { TripState } from '@/lib/trip-types';
import { SuggestionCard } from '@/components/trip/SuggestionCard';
import { PermitAlert } from '@/components/trip/PermitAlert';

interface SmartSuggestionsSidebarProps {
  state: TripState;
}

export function SmartSuggestionsSidebar({ state }: SmartSuggestionsSidebarProps) {
  const suggestions = useMemo(() => generateSuggestions(state), [state]);

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4">
        <Compass className="h-10 w-10 text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 leading-relaxed">
          Add activities to your itinerary to get personalized suggestions
        </p>
      </div>
    );
  }

  // Group suggestions by category
  const grouped = SUGGESTION_CATEGORY_ORDER.map((category) => ({
    category,
    label: SUGGESTION_CATEGORY_LABELS[category],
    items: suggestions.filter((s) => s.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="max-h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar space-y-5 pr-1">
      <h3 className="font-display text-lg font-semibold text-slate-100 mb-1">
        Smart Suggestions
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Based on your itinerary
      </p>

      {grouped.map((group) => (
        <section key={group.category}>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {group.label}
          </h4>
          <div className="space-y-2">
            {group.category === 'permit_alert' ? (
              <>
                {/* Render the PermitAlert banner for the first permit_alert suggestion */}
                {(() => {
                  const firstAlert = group.items.find(
                    (s) => s.type === 'permit_alert'
                  );
                  if (firstAlert) {
                    return (
                      <PermitAlert
                        trailNames={firstAlert.subtitle.split(', ')}
                        reason={firstAlert.reason}
                      />
                    );
                  }
                  return null;
                })()}
                {/* Render community/activity posts under permit_alert category */}
                {group.items
                  .filter((s) => s.type !== 'permit_alert')
                  .map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                    />
                  ))}
              </>
            ) : (
              group.items.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                />
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
