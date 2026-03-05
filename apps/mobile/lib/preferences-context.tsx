import { createContext, useContext, useReducer, useEffect, useRef, useState, type Dispatch, type ReactNode } from 'react';
import { loadFromStorage, saveToStorage } from './storage';

const STORAGE_KEY = 'cairn-preferences';

export type UnitSystem = 'imperial' | 'metric';

export interface UserPreferences {
  units: UnitSystem;
}

type PreferencesAction = { type: 'SET_UNITS'; units: UnitSystem };

interface PreferencesContextValue {
  preferences: UserPreferences;
  dispatch: Dispatch<PreferencesAction>;
  ready: boolean;
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

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, dispatch] = useReducer(preferencesReducer, DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    loadFromStorage<UserPreferences>(STORAGE_KEY).then((saved) => {
      if (saved && (saved.units === 'imperial' || saved.units === 'metric')) {
        dispatch({ type: 'SET_UNITS', units: saved.units });
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (ready) {
      saveToStorage(STORAGE_KEY, preferences);
    }
  }, [preferences, ready]);

  return (
    <PreferencesContext.Provider value={{ preferences, dispatch, ready }}>
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
