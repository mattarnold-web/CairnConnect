'use client';

import { useState, useCallback } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TrailQuiz } from './TrailQuiz';
import { QuizResultCard } from './QuizResultCard';
import type { ScoredTrail } from '@/lib/trail-recommender';

type PanelView = 'quiz' | 'results';

export function RecommendationPanel() {
  const [view, setView] = useState<PanelView>('quiz');
  const [results, setResults] = useState<ScoredTrail[]>([]);

  const handleQuizComplete = useCallback((scored: ScoredTrail[]) => {
    setResults(scored);
    setView('results');
  }, []);

  const handleRetake = useCallback(() => {
    setResults([]);
    setView('quiz');
  }, []);

  const handleBack = useCallback(() => {
    // In standalone mode, retake is the same as going back
    handleRetake();
  }, [handleRetake]);

  return (
    <div className="w-full">
      {view === 'quiz' && (
        <TrailQuiz onComplete={handleQuizComplete} onBack={handleBack} />
      )}

      {view === 'results' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-100">
                Your Trail Matches
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {results.length} trail{results.length !== 1 ? 's' : ''} matched your
                preferences
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRetake}>
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          </div>

          {/* Results grid */}
          {results.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {results.map((r) => (
                <QuizResultCard key={r.trail.id} result={r} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-cairn-border bg-cairn-card p-8 text-center">
              <p className="text-slate-400">
                No trails matched your criteria. Try different preferences!
              </p>
              <Button variant="primary" className="mt-4" onClick={handleRetake}>
                Retake Quiz
              </Button>
            </div>
          )}

          {/* AI Chat Coming Soon banner */}
          <div className="rounded-2xl border border-spotlight-gold/30 bg-spotlight-gold/5 p-5 flex items-start gap-4">
            <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-spotlight-gold/15">
              <Sparkles className="h-5 w-5 text-spotlight-gold" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-spotlight-gold">
                AI Chat Coming Soon
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Want personalized AI recommendations? Upgrade to Pro for conversational
                trail discovery powered by your riding history.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
