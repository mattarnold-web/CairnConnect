// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuizAnswers {
  vibe: 'chill' | 'moderate' | 'send_it' | null;
  duration: 'quick' | 'half_day' | 'full_day' | null;
  activities: string[];
  scenery: string[];
}

export interface ScoredTrail {
  trail: any;
  score: number;
  matchReasons: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const VIBE_DIFFICULTY_MAP: Record<string, string[]> = {
  chill: ['green', 'blue'],
  moderate: ['blue', 'black'],
  send_it: ['black', 'double_black', 'proline'],
};

const VIBE_ADJACENT: Record<string, string[]> = {
  chill: ['black'],
  moderate: ['green', 'double_black'],
  send_it: ['blue'],
};

const VIBE_LABELS: Record<string, string> = {
  chill: 'Great for a relaxed outing',
  moderate: 'Solid moderate challenge',
  send_it: 'Great for advanced riders',
};

const DURATION_LABELS: Record<string, string> = {
  quick: 'Quick hit adventure',
  half_day: 'Half-day adventure',
  full_day: 'Full-day epic',
};

const SCENERY_KEYWORDS = ['canyon', 'desert', 'river', 'mountain'] as const;

function scoreDuration(
  estimated: number,
  preference: 'quick' | 'half_day' | 'full_day' | null,
): { points: number; label: string | null } {
  if (!preference) return { points: 0, label: null };

  if (preference === 'quick') {
    if (estimated < 120) return { points: 20, label: DURATION_LABELS.quick };
    if (estimated <= 240) return { points: 10, label: null };
    return { points: 0, label: null };
  }

  if (preference === 'half_day') {
    if (estimated >= 120 && estimated <= 240) return { points: 20, label: DURATION_LABELS.half_day };
    if (estimated < 120 || (estimated > 240 && estimated <= 360)) return { points: 10, label: null };
    return { points: 0, label: null };
  }

  // full_day
  if (estimated > 240) return { points: 20, label: DURATION_LABELS.full_day };
  if (estimated >= 120) return { points: 10, label: null };
  return { points: 0, label: null };
}

const ACTIVITY_LABELS: Record<string, string> = {
  mtb: 'Mountain biking trail',
  hiking: 'Hiking trail',
  trail_running: 'Trail running route',
  climbing: 'Climbing area',
  kayaking: 'Kayaking route',
  road_cycling: 'Road cycling route',
};

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

/**
 * Score and rank trails based on quiz answers.
 * Pass in trails fetched from Supabase.
 */
export function scoreTrails(answers: QuizAnswers, trails: any[] = []): ScoredTrail[] {
  const results: ScoredTrail[] = [];

  for (const trail of trails) {
    let score = 0;
    const matchReasons: string[] = [];

    // --- Vibe / difficulty (30 pts max) ---
    if (answers.vibe) {
      const primary = VIBE_DIFFICULTY_MAP[answers.vibe] ?? [];
      const adjacent = VIBE_ADJACENT[answers.vibe] ?? [];

      if (primary.includes(trail.difficulty)) {
        score += 30;
        matchReasons.push(VIBE_LABELS[answers.vibe]);
      } else if (adjacent.includes(trail.difficulty)) {
        score += 15;
      }
    }

    // --- Duration (20 pts max) ---
    const dur = scoreDuration(trail.estimated_duration_minutes, answers.duration);
    score += dur.points;
    if (dur.label) matchReasons.push(dur.label);

    // --- Activities (25 pts max) ---
    if (answers.activities.length > 0) {
      const match = trail.activity_types.some((at: string) =>
        answers.activities.includes(at),
      );
      if (match) {
        score += 25;
        // Add the first matching activity as a reason
        const matched = trail.activity_types.find((at: string) =>
          answers.activities.includes(at),
        );
        if (matched && ACTIVITY_LABELS[matched]) {
          matchReasons.push(ACTIVITY_LABELS[matched]);
        }
      }
    }

    // --- Scenery bonus (up to +10 per keyword, but cap contribution) ---
    if (answers.scenery.length > 0) {
      const haystack = `${trail.name} ${trail.description ?? ''}`.toLowerCase();
      let sceneryBonus = 0;
      for (const keyword of answers.scenery) {
        if (SCENERY_KEYWORDS.includes(keyword as (typeof SCENERY_KEYWORDS)[number])) {
          if (haystack.includes(keyword.toLowerCase())) {
            sceneryBonus += 10;
            matchReasons.push(
              `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} scenery`,
            );
          }
        }
      }
      score += sceneryBonus;
    }

    // --- Rating bonus (up to 15 pts) ---
    score += Math.min(trail.rating * 3, 15);

    // Clamp to 100
    score = Math.min(Math.round(score), 100);

    if (score >= 20) {
      results.push({ trail, score, matchReasons });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results;
}
