'use client';

import { createContext, useContext, useReducer, useEffect, useRef, useState, type Dispatch } from 'react';

const STORAGE_KEY = 'cairn-preferences';

export type UnitSystem = 'imperial' | 'metric';

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'bike' | 'climbing' | 'ski' | 'paddle' | 'camping' | 'other';
}

export interface UserPreferences {
  units: UnitSystem;
  language: string;
  timezone: string;
  equipment: EquipmentItem[];
  profilePicture: string | null;
  displayName: string;
  bio: string;
}

type PreferencesAction =
  | { type: 'SET_UNITS'; units: UnitSystem }
  | { type: 'SET_LANGUAGE'; language: string }
  | { type: 'SET_TIMEZONE'; timezone: string }
  | { type: 'ADD_EQUIPMENT'; item: EquipmentItem }
  | { type: 'REMOVE_EQUIPMENT'; id: string }
  | { type: 'SET_PROFILE_PICTURE'; url: string | null }
  | { type: 'SET_DISPLAY_NAME'; name: string }
  | { type: 'SET_BIO'; bio: string }
  | { type: 'HYDRATE'; preferences: UserPreferences };

interface PreferencesContextValue {
  preferences: UserPreferences;
  dispatch: Dispatch<PreferencesAction>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  units: 'imperial',
  language: 'en',
  timezone: 'America/Denver',
  equipment: [],
  profilePicture: null,
  displayName: '',
  bio: '',
};

function preferencesReducer(state: UserPreferences, action: PreferencesAction): UserPreferences {
  switch (action.type) {
    case 'SET_UNITS':
      return { ...state, units: action.units };
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'SET_TIMEZONE':
      return { ...state, timezone: action.timezone };
    case 'ADD_EQUIPMENT':
      return { ...state, equipment: [...state.equipment, action.item] };
    case 'REMOVE_EQUIPMENT':
      return { ...state, equipment: state.equipment.filter((e) => e.id !== action.id) };
    case 'SET_PROFILE_PICTURE':
      return { ...state, profilePicture: action.url };
    case 'SET_DISPLAY_NAME':
      return { ...state, displayName: action.name };
    case 'SET_BIO':
      return { ...state, bio: action.bio };
    case 'HYDRATE':
      return action.preferences;
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
      return { ...DEFAULT_PREFERENCES, ...parsed } as UserPreferences;
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

export function PreferencesProvider({ children }: { children: any }) {
  const [preferences, dispatch] = useReducer(preferencesReducer, DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'HYDRATE', preferences: saved });
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on changes (skip until hydrated)
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(preferences);
  }, [preferences, hydrated]);

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
