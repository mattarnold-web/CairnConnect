'use client';

import { useMemo } from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';
import { estimateTripCost } from '@/lib/trip-cost';
import type { TripState } from '@/lib/trip-types';

const UNIT_LABELS: Record<string, string> = {
  per_person: '/person',
  per_group: '/group',
  flat: '',
};

interface CostBreakdownProps {
  state: TripState;
}

export function CostBreakdown({ state }: CostBreakdownProps) {
  const estimate = useMemo(() => estimateTripCost(state), [state]);

  if (estimate.items.length === 0 && estimate.permitCosts === 0) return null;

  // Group items by category
  const grouped = new Map<string, typeof estimate.items>();
  for (const item of estimate.items) {
    const existing = grouped.get(item.category) || [];
    existing.push(item);
    grouped.set(item.category, existing);
  }

  return (
    <div className="rounded-2xl bg-cairn-card border border-cairn-border p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-lg bg-canopy/15 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-canopy" />
        </div>
        <h3 className="font-display text-lg font-semibold text-slate-100">
          Estimated Costs
        </h3>
      </div>

      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="space-y-1.5">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-300 truncate">{item.label}</span>
                    {item.bookingUrl && (
                      <a
                        href={item.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-canopy hover:text-canopy-dark transition-colors"
                        title="Book now"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <span className="text-slate-400 shrink-0 ml-3">
                    ${item.min}–${item.max}
                    <span className="text-slate-500 text-xs">
                      {UNIT_LABELS[item.unit] || ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {estimate.permitCosts > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Permits
            </h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Trail Permits</span>
              <span className="text-slate-400">${estimate.permitCosts}</span>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-cairn-border flex items-center justify-between">
        <span className="font-display font-semibold text-slate-100">
          Estimated Total
        </span>
        <span className="font-display text-lg font-bold text-canopy">
          ${estimate.totalMin}–${estimate.totalMax}
        </span>
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        Estimates based on typical pricing. Actual costs may vary by season, group size, and availability.
      </p>
    </div>
  );
}
