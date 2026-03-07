'use client';

import { createContext, useContext, useReducer, useEffect, useRef, type Dispatch } from 'react';
import type { RecordedActivity, GpsPoint } from './activity-types';
import { haversineDistance } from '@cairn/shared';

const STORAGE_KEY = 'cairn-activities';

interface ActivityState {
  activities: RecordedActivity[];
  activeId: string | null;
}

type ActivityAction =
  | { type: 'START_RECORDING'; activity: RecordedActivity }
  | { type: 'PAUSE_RECORDING' }
  | { type: 'RESUME_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'ADD_GPS_POINT'; point: GpsPoint }
  | { type: 'ADD_PHOTO'; photoId: string }
  | { type: 'UPDATE_NOTES'; notes: string }
  | { type: 'DELETE_ACTIVITY'; id: string };

interface ActivityContextValue {
  state: ActivityState;
  dispatch: Dispatch<ActivityAction>;
  activeActivity: RecordedActivity | null;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

function loadFromStorage(): ActivityState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.activities)) {
      return parsed as ActivityState;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(state: ActivityState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

const DEFAULT_STATE: ActivityState = {
  activities: [],
  activeId: null,
};

function updateActive(state: ActivityState, updater: (a: RecordedActivity) => RecordedActivity): ActivityState {
  if (!state.activeId) return state;
  return {
    ...state,
    activities: state.activities.map((a) =>
      a.id === state.activeId ? updater(a) : a
    ),
  };
}

function activityReducer(state: ActivityState, action: ActivityAction): ActivityState {
  switch (action.type) {
    case 'START_RECORDING':
      return {
        ...state,
        activities: [...state.activities, action.activity],
        activeId: action.activity.id,
      };

    case 'PAUSE_RECORDING':
      return updateActive(state, (a) => ({ ...a, status: 'paused' }));

    case 'RESUME_RECORDING':
      return updateActive(state, (a) => ({ ...a, status: 'recording' }));

    case 'STOP_RECORDING':
      return {
        ...updateActive(state, (a) => ({
          ...a,
          status: 'completed',
          endedAt: new Date().toISOString(),
          durationSeconds: Math.round((Date.now() - new Date(a.startedAt).getTime()) / 1000),
        })),
        activeId: null,
      };

    case 'ADD_GPS_POINT':
      return updateActive(state, (a) => {
        const track = [...a.gpsTrack, action.point];
        let dist = a.distanceMeters;
        let gain = a.elevationGainMeters;
        let loss = a.elevationLossMeters;
        let maxElev = a.maxElevationMeters;
        let minElev = a.minElevationMeters;

        if (track.length >= 2) {
          const prev = track[track.length - 2];
          const curr = action.point;
          dist += haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng) * 1000;

          if (prev.altitude != null && curr.altitude != null) {
            const elevDiff = curr.altitude - prev.altitude;
            if (elevDiff > 0) gain += elevDiff;
            else loss += Math.abs(elevDiff);
          }
        }

        if (action.point.altitude != null) {
          maxElev = maxElev != null ? Math.max(maxElev, action.point.altitude) : action.point.altitude;
          minElev = minElev != null ? Math.min(minElev, action.point.altitude) : action.point.altitude;
        }

        return {
          ...a,
          gpsTrack: track,
          distanceMeters: dist,
          elevationGainMeters: gain,
          elevationLossMeters: loss,
          maxElevationMeters: maxElev,
          minElevationMeters: minElev,
        };
      });

    case 'ADD_PHOTO':
      return updateActive(state, (a) => ({
        ...a,
        photos: [...a.photos, action.photoId],
      }));

    case 'UPDATE_NOTES':
      return updateActive(state, (a) => ({ ...a, notes: action.notes }));

    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter((a) => a.id !== action.id),
        activeId: state.activeId === action.id ? null : state.activeId,
      };

    default:
      return state;
  }
}

export function ActivityProvider({ children }: { children: any }) {
  const [state, dispatch] = useReducer(activityReducer, null, () => {
    const saved = loadFromStorage();
    return saved ?? DEFAULT_STATE;
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToStorage(state);
  }, [state]);

  const activeActivity = state.activeId
    ? state.activities.find((a) => a.id === state.activeId) ?? null
    : null;

  return (
    <ActivityContext.Provider value={{ state, dispatch, activeActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext(): ActivityContextValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error('useActivityContext must be used within an ActivityProvider');
  }
  return ctx;
}
