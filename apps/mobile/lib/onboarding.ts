import { loadFromStorage, saveToStorage } from './storage';

const ONBOARDING_KEY = 'cairn-onboarding-completed';
const SELECTED_ACTIVITIES_KEY = 'cairn-selected-activities';

export async function isOnboardingCompleted(): Promise<boolean> {
  const completed = await loadFromStorage<boolean>(ONBOARDING_KEY);
  return completed === true;
}

export async function setOnboardingCompleted(): Promise<void> {
  await saveToStorage(ONBOARDING_KEY, true);
}

export async function saveSelectedActivities(slugs: string[]): Promise<void> {
  await saveToStorage(SELECTED_ACTIVITIES_KEY, slugs);
}

export async function loadSelectedActivities(): Promise<string[]> {
  const saved = await loadFromStorage<string[]>(SELECTED_ACTIVITIES_KEY);
  return saved ?? [];
}
