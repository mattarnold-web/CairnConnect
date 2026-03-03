'use client';

import { useTripContext } from '@/lib/trip-context';
import type { TripStep } from '@/lib/trip-types';
import { RegionPicker } from '@/components/trip/RegionPicker';
import { ActivityPicker } from '@/components/trip/ActivityPicker';
import { ItineraryBuilder } from '@/components/trip/ItineraryBuilder';
import { TripSummary } from '@/components/trip/TripSummary';

const STEPS: { key: TripStep; label: string }[] = [
  { key: 'region', label: 'Region' },
  { key: 'activities', label: 'Activities' },
  { key: 'itinerary', label: 'Itinerary' },
  { key: 'summary', label: 'Summary' },
];

function getStepIndex(step: TripStep): number {
  return STEPS.findIndex((s) => s.key === step);
}

export function TripWizard() {
  const { state, dispatch } = useTripContext();

  const currentIndex = getStepIndex(state.currentStep);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Step indicator bar */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-canopy text-white'
                      : isCompleted
                        ? 'bg-canopy/20 text-canopy'
                        : 'bg-cairn-elevated text-slate-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    isActive
                      ? 'text-canopy'
                      : isCompleted
                        ? 'text-canopy/70'
                        : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {index < STEPS.length - 1 && (
                <div
                  className={`h-px w-12 sm:w-20 mx-2 ${
                    index < currentIndex ? 'bg-canopy/30' : 'bg-cairn-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div>
        {state.currentStep === 'region' && (
          <RegionPicker dispatch={dispatch} />
        )}
        {state.currentStep === 'activities' && (
          <ActivityPicker state={state} dispatch={dispatch} />
        )}
        {state.currentStep === 'itinerary' && (
          <ItineraryBuilder state={state} dispatch={dispatch} />
        )}
        {state.currentStep === 'summary' && (
          <TripSummary state={state} dispatch={dispatch} />
        )}
      </div>
    </div>
  );
}
