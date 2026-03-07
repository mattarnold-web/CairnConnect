import { TripState } from './trip-types';
import { generateSuggestions } from './trip-suggestions';

export interface CostLineItem {
  label: string;
  category: string;
  min: number;
  max: number;
  unit: string;
  bookingUrl: string | null;
}

export interface CostEstimate {
  items: CostLineItem[];
  totalMin: number;
  totalMax: number;
  permitCosts: number;
}

const SUGGESTION_CATEGORY_LABEL_MAP: Record<string, string> = {
  shuttle: 'Shuttle',
  bike_service: 'Bike Service',
  gear_rental: 'Gear & Rental',
  guide_service: 'Guide Service',
  water_sports: 'Water Sports',
  food_drink: 'Food & Drink',
  accommodation: 'Accommodation',
};

/**
 * Estimate trip costs from suggestions and trail data.
 * Accepts optional pre-fetched data for businesses and trails.
 */
export function estimateTripCost(
  state: TripState,
  businessData?: any[],
  trailCache?: Record<string, any>,
): CostEstimate {
  const suggestions = generateSuggestions(state, undefined, businessData);
  const items: CostLineItem[] = [];
  const businesses = businessData ?? [];

  // Build cost line items from business suggestions that have a price_range
  for (const suggestion of suggestions) {
    if (suggestion.type !== 'business' || !suggestion.businessSlug) continue;

    const business = businesses.find(
      (b: any) => b.slug === suggestion.businessSlug,
    );
    if (!business) continue;

    const priceRange = (business as any).price_range;
    if (!priceRange) continue;

    items.push({
      label: business.name,
      category:
        SUGGESTION_CATEGORY_LABEL_MAP[suggestion.category] ||
        suggestion.category,
      min: priceRange.min,
      max: priceRange.max,
      unit: priceRange.unit,
      bookingUrl: business.booking_url,
    });
  }

  // Calculate permit costs from trails in the itinerary
  let permitCosts = 0;
  const countedTrailIds = new Set<string>();
  const cache = trailCache ?? {};

  for (const day of state.days) {
    for (const item of day.items) {
      if (item.type === 'trail' && item.trailId && !countedTrailIds.has(item.trailId)) {
        countedTrailIds.add(item.trailId);
        const trail = cache[item.trailId];
        if (trail && trail.requires_permit) {
          permitCosts += trail.permit_cost || 0;
        }
      }
    }
  }

  const totalMin =
    items.reduce((sum, item) => sum + item.min, 0) + permitCosts;
  const totalMax =
    items.reduce((sum, item) => sum + item.max, 0) + permitCosts;

  return {
    items,
    totalMin,
    totalMax,
    permitCosts,
  };
}
