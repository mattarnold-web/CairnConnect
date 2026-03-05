import { createContext, useContext, useReducer, useEffect, useRef, useState, type Dispatch, type ReactNode } from 'react';
import { tripReducer, createInitialTripState, type TripState, type TripAction } from './trip-types';
import { loadFromStorage, saveToStorage } from './storage';

const STORAGE_KEY = 'cairn-trip-state';

interface TripContextValue {
  state: TripState;
  dispatch: Dispatch<TripAction>;
  ready: boolean;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, createInitialTripState());
  const [ready, setReady] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    loadFromStorage<TripState>(STORAGE_KEY).then((saved) => {
      if (saved && saved.id && Array.isArray(saved.days)) {
        dispatch({ type: 'LOAD_STATE', state: saved });
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
      saveToStorage(STORAGE_KEY, state);
    }
  }, [state, ready]);

  return (
    <TripContext.Provider value={{ state, dispatch, ready }}>
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
