/**
 * useLocationSearch
 * =================
 * Debounced autocomplete + full search hook for the CairnConnect mobile app.
 *
 * Usage:
 *   const { suggestions, loading, onQueryChange, fullSearch, clearSuggestions } =
 *     useLocationSearch({ lat, lng });
 *
 *   // Wire `onQueryChange` to a TextInput's `onChangeText`
 *   // Wire `fullSearch` to the search/submit button
 */

import { useState, useRef, useCallback } from 'react';
import {
  autocompleteLocations,
  searchAll,
  type AutocompleteResult,
  type SearchLocationResult,
} from '../lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseLocationSearchOptions {
  /** User's current latitude (optional, improves result ordering). */
  lat?: number;
  /** User's current longitude (optional, improves result ordering). */
  lng?: number;
  /** Debounce interval in ms for autocomplete. Default: 250. */
  debounceMs?: number;
  /** Max autocomplete suggestions to return. Default: 8. */
  maxSuggestions?: number;
}

export interface UseLocationSearchReturn {
  /** Current autocomplete suggestions (updated on each keystroke). */
  suggestions: AutocompleteResult[];
  /** Full search results (populated after calling `fullSearch`). */
  results: SearchLocationResult[];
  /** Whether an autocomplete or full search request is in flight. */
  loading: boolean;
  /** The current query string being tracked internally. */
  query: string;
  /** Call this on every keystroke — triggers debounced autocomplete. */
  onQueryChange: (text: string) => void;
  /** Execute a full search (call on submit / "Search" button press). */
  fullSearch: (overrideQuery?: string) => Promise<void>;
  /** Clear autocomplete suggestions (e.g., when user dismisses the list). */
  clearSuggestions: () => void;
  /** Clear all state (suggestions, results, query). */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLocationSearch(
  options: UseLocationSearchOptions = {},
): UseLocationSearchReturn {
  const { lat, lng, debounceMs = 250, maxSuggestions = 8 } = options;

  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [results, setResults] = useState<SearchLocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Ref to track the latest debounce timer so we can cancel stale requests.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref to track the latest autocomplete request id to discard stale responses.
  const requestIdRef = useRef(0);

  // -------------------------------------------------------------------------
  // Debounced autocomplete
  // -------------------------------------------------------------------------

  const onQueryChange = useCallback(
    (text: string) => {
      setQuery(text);

      // Clear any pending debounce timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // If the query is too short, clear suggestions immediately
      if (!text || text.trim().length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      timerRef.current = setTimeout(async () => {
        const id = ++requestIdRef.current;

        try {
          const data = await autocompleteLocations(text, lat, lng, maxSuggestions);

          // Only apply if this is still the latest request
          if (id === requestIdRef.current) {
            setSuggestions(data);
          }
        } catch {
          // Silently swallow autocomplete errors — the UI stays usable
          if (id === requestIdRef.current) {
            setSuggestions([]);
          }
        } finally {
          if (id === requestIdRef.current) {
            setLoading(false);
          }
        }
      }, debounceMs);
    },
    [lat, lng, debounceMs, maxSuggestions],
  );

  // -------------------------------------------------------------------------
  // Full search
  // -------------------------------------------------------------------------

  const fullSearch = useCallback(
    async (overrideQuery?: string) => {
      const q = overrideQuery ?? query;
      if (!q || q.trim().length === 0) return;

      setLoading(true);
      setSuggestions([]); // dismiss autocomplete dropdown

      try {
        const { results: searchResults } = await searchAll({
          query: q,
          lat,
          lng,
        });
        setResults(searchResults);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, lat, lng],
  );

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setLoading(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    suggestions,
    results,
    loading,
    query,
    onQueryChange,
    fullSearch,
    clearSuggestions,
    reset,
  };
}
