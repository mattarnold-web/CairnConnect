'use client';

import { createContext, useContext, useReducer, useEffect, useRef, type Dispatch } from 'react';
import { tripReducer, createInitialTripState, type TripState, type TripAction } from './trip-types';

const STORAGE_KEY = 'cairn-trip-state';

interface TripContextValue {
  state: TripState;
  dispatch: Dispatch<TripAction>;
}

const TripContext = createContext<TripContextValue | null>(null);

function loadFromStorage(): TripState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && Array.isArray(parsed.days)) {
      return parsed as TripState;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(state: TripState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — ignore
  }
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, null, () => {
    const saved = loadFromStorage();
    return saved ?? createInitialTripState();
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToStorage(state);
  }, [state]);

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return ctx;
}
