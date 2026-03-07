export type TripStep = 'region' | 'activities' | 'itinerary' | 'summary';

export interface TripRegion {
  slug: string;
  name: string;
  state_province: string;
  country: string;
  continent: string;
  description: string;
  coverEmoji: string;
  trailCount: number;
  businessCount: number;
  hasData: boolean;
  lat?: number;
  lng?: number;
}

export interface TripDay {
  id: string;
  dayNumber: number;
  date: string | null;
  label: string;
  items: TripDayItem[];
}

export interface TripDayItem {
  id: string;
  type: 'trail' | 'custom';
  trailId: string | null;
  customTitle: string | null;
  customActivityType: string | null;
  notes: string;
  timeSlot: 'morning' | 'midday' | 'afternoon' | 'evening' | null;
}

export interface TripState {
  id: string;
  shareCode: string;
  currentStep: TripStep;
  region: TripRegion | null;
  selectedActivities: string[];
  startDate: string | null;
  endDate: string | null;
  days: TripDay[];
  tripName: string;
}

export type TripAction =
  | { type: 'SET_STEP'; step: TripStep }
  | { type: 'SET_REGION'; region: TripRegion }
  | { type: 'TOGGLE_ACTIVITY'; activitySlug: string }
  | { type: 'SET_START_DATE'; date: string }
  | { type: 'SET_END_DATE'; date: string }
  | { type: 'SET_TRIP_NAME'; name: string }
  | { type: 'ADD_DAY' }
  | { type: 'REMOVE_DAY'; dayId: string }
  | { type: 'ADD_ITEM_TO_DAY'; dayId: string; item: TripDayItem }
  | { type: 'REMOVE_ITEM_FROM_DAY'; dayId: string; itemId: string }
  | { type: 'REORDER_ITEM'; dayId: string; fromIndex: number; toIndex: number }
  | { type: 'UPDATE_ITEM_NOTES'; dayId: string; itemId: string; notes: string }
  | { type: 'UPDATE_ITEM_TIME_SLOT'; dayId: string; itemId: string; timeSlot: TripDayItem['timeSlot'] }
  | { type: 'UPDATE_DAY_LABEL'; dayId: string; label: string }
  | { type: 'LOAD_STATE'; state: TripState }
  | { type: 'RESET' };

function generateId(): string {
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateShareCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function createInitialTripState(): TripState {
  return {
    id: generateId(),
    shareCode: generateShareCode(),
    currentStep: 'region',
    region: null,
    selectedActivities: [],
    startDate: null,
    endDate: null,
    days: [
      { id: 'day-1', dayNumber: 1, date: null, label: '', items: [] },
      { id: 'day-2', dayNumber: 2, date: null, label: '', items: [] },
      { id: 'day-3', dayNumber: 3, date: null, label: '', items: [] },
    ],
    tripName: '',
  };
}

export const initialTripState: TripState = createInitialTripState();

/** Build an array of TripDay for a date range, preserving existing items where possible. */
function buildDaysForRange(
  startDate: string,
  endDate: string,
  existingDays: TripDay[],
): TripDay[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const dayCount = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const days: TripDay[] = [];
  for (let i = 0; i < dayCount; i++) {
    const existing = existingDays[i];
    days.push({
      id: existing?.id ?? `day-${Date.now()}-${i}`,
      dayNumber: i + 1,
      date: new Date(start + i * 86400000).toISOString(),
      label: existing?.label ?? '',
      items: existing?.items ?? [],
    });
  }
  return days;
}

export function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'SET_REGION':
      return { ...state, region: action.region };

    case 'TOGGLE_ACTIVITY': {
      const exists = state.selectedActivities.includes(action.activitySlug);
      return {
        ...state,
        selectedActivities: exists
          ? state.selectedActivities.filter((s) => s !== action.activitySlug)
          : [...state.selectedActivities, action.activitySlug],
      };
    }

    case 'SET_START_DATE': {
      if (state.endDate) {
        const days = buildDaysForRange(action.date, state.endDate, state.days);
        return { ...state, startDate: action.date, days };
      }
      const newDays = state.days.map((day) => ({
        ...day,
        date: new Date(
          new Date(action.date).getTime() + (day.dayNumber - 1) * 86400000
        ).toISOString(),
      }));
      return { ...state, startDate: action.date, days: newDays };
    }

    case 'SET_END_DATE': {
      if (state.startDate) {
        const days = buildDaysForRange(state.startDate, action.date, state.days);
        return { ...state, endDate: action.date, days };
      }
      return { ...state, endDate: action.date };
    }

    case 'SET_TRIP_NAME':
      return { ...state, tripName: action.name };

    case 'ADD_DAY': {
      const newDayNum = state.days.length + 1;
      const newDay: TripDay = {
        id: `day-${Date.now()}`,
        dayNumber: newDayNum,
        date: state.startDate
          ? new Date(
              new Date(state.startDate).getTime() + (newDayNum - 1) * 86400000
            ).toISOString()
          : null,
        label: '',
        items: [],
      };
      return { ...state, days: [...state.days, newDay] };
    }

    case 'REMOVE_DAY': {
      if (state.days.length <= 1) return state;
      const filtered = state.days.filter((d) => d.id !== action.dayId);
      const renumbered = filtered.map((d, i) => ({
        ...d,
        dayNumber: i + 1,
        date: state.startDate
          ? new Date(
              new Date(state.startDate).getTime() + i * 86400000
            ).toISOString()
          : null,
      }));
      return { ...state, days: renumbered };
    }

    case 'ADD_ITEM_TO_DAY':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.dayId
            ? { ...day, items: [...day.items, action.item] }
            : day
        ),
      };

    case 'REMOVE_ITEM_FROM_DAY':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.dayId
            ? { ...day, items: day.items.filter((i) => i.id !== action.itemId) }
            : day
        ),
      };

    case 'REORDER_ITEM':
      return {
        ...state,
        days: state.days.map((day) => {
          if (day.id !== action.dayId) return day;
          const items = [...day.items];
          const [moved] = items.splice(action.fromIndex, 1);
          items.splice(action.toIndex, 0, moved);
          return { ...day, items };
        }),
      };

    case 'UPDATE_ITEM_NOTES':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.dayId
            ? {
                ...day,
                items: day.items.map((i) =>
                  i.id === action.itemId ? { ...i, notes: action.notes } : i
                ),
              }
            : day
        ),
      };

    case 'UPDATE_ITEM_TIME_SLOT':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.dayId
            ? {
                ...day,
                items: day.items.map((i) =>
                  i.id === action.itemId
                    ? { ...i, timeSlot: action.timeSlot }
                    : i
                ),
              }
            : day
        ),
      };

    case 'UPDATE_DAY_LABEL':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.dayId ? { ...day, label: action.label } : day
        ),
      };

    case 'LOAD_STATE':
      return action.state;

    case 'RESET':
      return createInitialTripState();

    default:
      return state;
  }
}
