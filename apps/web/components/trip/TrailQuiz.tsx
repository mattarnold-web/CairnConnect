'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { clsx } from 'clsx';
import { FilterChip } from '@/components/ui/FilterChip';
import { Button } from '@/components/ui/Button';
import { ActivityIcon, ACTIVITIES } from '@/components/ui/ActivityIcon';
import { scoreTrails, type QuizAnswers, type ScoredTrail } from '@/lib/trail-recommender';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TrailQuizProps {
  onComplete: (results: ScoredTrail[]) => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Step data
// ---------------------------------------------------------------------------

const VIBE_OPTIONS: {
  value: QuizAnswers['vibe'];
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    value: 'chill',
    label: 'Chill',
    emoji: '\u{1F7E2}',
    description: 'Easy going, scenic views, relaxed pace',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    emoji: '\u{1F7E0}',
    description: 'Some challenge, good workout, rewarding views',
  },
  {
    value: 'send_it',
    label: 'Send It',
    emoji: '\u{1F534}',
    description: 'Technical, steep, adrenaline-pumping',
  },
];

const DURATION_OPTIONS: {
  value: NonNullable<QuizAnswers['duration']>;
  label: string;
  description: string;
}[] = [
  { value: 'quick', label: 'Quick Hit', description: 'Under 2 hours' },
  { value: 'half_day', label: 'Half Day', description: '2-4 hours' },
  { value: 'full_day', label: 'Full Day', description: '4+ hours of adventure' },
];

const ACTIVITY_OPTIONS = ACTIVITIES.filter((a) =>
  ['mtb', 'hiking', 'trail_running', 'climbing', 'kayaking', 'road_cycling'].includes(a.slug)
);

const SCENERY_OPTIONS: { slug: string; label: string; emoji: string }[] = [
  { slug: 'canyon', label: 'Canyon', emoji: '\u{1F3DC}\u{FE0F}' },
  { slug: 'desert', label: 'Desert', emoji: '\u2600\u{FE0F}' },
  { slug: 'river', label: 'River', emoji: '\u{1F30A}' },
  { slug: 'mountain', label: 'Mountain', emoji: '\u26F0\u{FE0F}' },
];

const TOTAL_STEPS = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TrailQuiz({ onComplete, onBack }: TrailQuizProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    vibe: null,
    duration: null,
    activities: [],
    scenery: [],
  });

  // ---- Handlers ----

  const handleVibe = useCallback((v: QuizAnswers['vibe']) => {
    setAnswers((prev) => ({ ...prev, vibe: v }));
  }, []);

  const handleDuration = useCallback((d: QuizAnswers['duration']) => {
    setAnswers((prev) => ({ ...prev, duration: d }));
  }, []);

  const toggleActivity = useCallback((slug: string) => {
    setAnswers((prev) => ({
      ...prev,
      activities: prev.activities.includes(slug)
        ? prev.activities.filter((a) => a !== slug)
        : [...prev.activities, slug],
    }));
  }, []);

  const toggleScenery = useCallback((slug: string) => {
    setAnswers((prev) => ({
      ...prev,
      scenery: prev.scenery.includes(slug)
        ? prev.scenery.filter((s) => s !== slug)
        : [...prev.scenery, slug],
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      // Final step -- score and complete
      const results = scoreTrails(answers);
      onComplete(results);
    }
  }, [step, answers, onComplete]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      onBack();
    }
  }, [step, onBack]);

  // Can advance?
  const canAdvance =
    (step === 1 && answers.vibe !== null) ||
    (step === 2 && answers.duration !== null) ||
    (step === 3 && answers.activities.length > 0) ||
    step === 4; // scenery is optional

  // ---- Render helpers ----

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Compass className="h-8 w-8 text-canopy mx-auto mb-3" />
              <h2 className="font-display text-2xl font-bold text-gray-900">
                What&apos;s your vibe?
              </h2>
              <p className="text-sm text-gray-500 mt-1">Pick the energy level for your adventure</p>
            </div>
            <div className="grid gap-3">
              {VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleVibe(opt.value)}
                  className={clsx(
                    'rounded-2xl bg-white border p-5 cursor-pointer transition-colors text-left',
                    answers.vibe === opt.value
                      ? 'border-canopy bg-canopy/10'
                      : 'border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <p className="font-display font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                How long do you want to ride?
              </h2>
              <p className="text-sm text-gray-500 mt-1">Choose your ideal duration</p>
            </div>
            <div className="grid gap-3">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleDuration(opt.value)}
                  className={clsx(
                    'rounded-2xl bg-white border p-5 cursor-pointer transition-colors text-left',
                    answers.duration === opt.value
                      ? 'border-canopy bg-canopy/10'
                      : 'border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <p className="font-display font-semibold text-gray-900">{opt.label}</p>
                  <p className="text-sm text-gray-500">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                What are you into?
              </h2>
              <p className="text-sm text-gray-500 mt-1">Select all that apply</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {ACTIVITY_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.slug}
                  label={opt.label}
                  icon={<ActivityIcon activity={opt.slug} size="xs" />}
                  active={answers.activities.includes(opt.slug)}
                  onClick={() => toggleActivity(opt.slug)}
                />
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                What scenery calls to you?
              </h2>
              <p className="text-sm text-gray-500 mt-1">Optional - select any that appeal to you</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SCENERY_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.slug}
                  label={opt.label}
                  emoji={opt.emoji}
                  active={answers.scenery.includes(opt.slug)}
                  onClick={() => toggleScenery(opt.slug)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Content */}
      <div className="min-h-[340px] flex flex-col justify-center">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canAdvance}
        >
          {step === TOTAL_STEPS ? 'See Results' : 'Next'}
          {step < TOTAL_STEPS && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'h-2 w-2 rounded-full transition-colors duration-200',
              i + 1 === step
                ? 'bg-canopy'
                : i + 1 < step
                  ? 'bg-canopy/40'
                  : 'bg-cairn-border',
            )}
          />
        ))}
      </div>
    </div>
  );
}
