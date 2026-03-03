'use client';

import { createContext, useContext, useReducer, useEffect, useRef, type Dispatch } from 'react';

const STORAGE_KEY = 'cairn-preferences';

export type UnitSystem = 'imperial' | 'metric';

export interface UserPreferences {
  units: UnitSystem;
}

type PreferencesAction = { type: 'SET_UNITS'; units: UnitSystem };

interface PreferencesContextValue {
  preferences: UserPreferences;
  dispatch: Dispatch<PreferencesAction>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  units: 'imperial',
};

function preferencesReducer(state: UserPreferences, action: PreferencesAction): UserPreferences {
  switch (action.type) {
    case 'SET_UNITS':
      return { ...state, units: action.units };
    default:
      return state;
  }
}

function loadFromStorage(): UserPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.units === 'imperial' || parsed.units === 'metric')) {
      return parsed as UserPreferences;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or unavailable
  }
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, dispatch] = useReducer(preferencesReducer, null, () => {
    const saved = loadFromStorage();
    return saved ?? DEFAULT_PREFERENCES;
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToStorage(preferences);
  }, [preferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, dispatch }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
}
