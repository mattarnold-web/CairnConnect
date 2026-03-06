import { TripState } from './trip-types';

export type SuggestionCategory =
  | 'shuttle'
  | 'bike_service'
  | 'gear_rental'
  | 'guide_service'
  | 'water_sports'
  | 'food_drink'
  | 'accommodation'
  | 'permit_alert'
  | 'community';

export interface TripSuggestion {
  id: string;
  type: 'business' | 'activity_post' | 'permit_alert';
  category: SuggestionCategory;
  title: string;
  subtitle: string;
  emoji: string;
  reason: string;
  businessSlug?: string;
  activityPostId?: string;
  priority: number;
  specialOffer?: string;
  isSpotlight?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  bike_shop: '\u{1F6B2}',
  gear_rental: '\u{1F392}',
  guide_service: '\u{1F9ED}',
  outfitter: '\u{1F3D5}\u{FE0F}',
  outdoor_gear_shop: '\u{1F6D2}',
  bike_shuttle: '\u{1F690}',
  mountain_hut: '\u{1F3D4}\u{FE0F}',
  kayak_sup: '\u{1F6F6}',
  surf_school: '\u{1F3C4}',
  adventure_hostel: '\u{1F3E0}',
  camping: '\u26FA',
  trailhead_cafe: '\u2615',
  outdoor_club: '\u{1F91D}',
};

const CATEGORY_LABELS: Record<string, string> = {
  bike_shop: 'Bike Shop',
  gear_rental: 'Gear Rental',
  guide_service: 'Guide Service',
  outfitter: 'Outfitter',
  outdoor_gear_shop: 'Outdoor Gear',
  bike_shuttle: 'Shuttle Service',
  mountain_hut: 'Mountain Hut',
  kayak_sup: 'Kayak & SUP',
  surf_school: 'Surf School',
  adventure_hostel: 'Hostel',
  camping: 'Camping',
  trailhead_cafe: 'Cafe',
  outdoor_club: 'Club',
};

const ACTIVITY_LABELS: Record<string, string> = {
  mtb: 'Mountain Biking',
  hiking: 'Hiking',
  trail_running: 'Trail Running',
  climbing: 'Rock Climbing',
  road_cycling: 'Road Cycling',
  kayaking: 'Kayaking',
  whitewater: 'Whitewater Rafting',
  standup_paddle: 'Paddleboarding',
  camping: 'Camping',
};

// Maps activity types to relevant business categories
const ACTIVITY_TO_BUSINESS_CATEGORIES: Record<string, string[]> = {
  mtb: ['bike_shop', 'bike_shuttle', 'gear_rental'],
  road_cycling: ['bike_shop'],
  hiking: ['guide_service', 'gear_rental', 'outdoor_gear_shop'],
  trail_running: ['outdoor_gear_shop'],
  climbing: ['guide_service', 'outdoor_gear_shop', 'gear_rental'],
  kayaking: ['kayak_sup', 'outfitter', 'gear_rental'],
  standup_paddle: ['kayak_sup'],
  whitewater: ['outfitter', 'kayak_sup'],
  camping: ['gear_rental', 'camping'],
};

function mapToSuggestionCategory(bizCategory: string): SuggestionCategory {
  switch (bizCategory) {
    case 'bike_shop':
      return 'bike_service';
    case 'bike_shuttle':
      return 'shuttle';
    case 'gear_rental':
    case 'outdoor_gear_shop':
    case 'outfitter':
      return 'gear_rental';
    case 'guide_service':
      return 'guide_service';
    case 'kayak_sup':
      return 'water_sports';
    case 'trailhead_cafe':
      return 'food_drink';
    case 'adventure_hostel':
    case 'camping':
      return 'accommodation';
    default:
      return 'gear_rental';
  }
}

const SUGGESTION_CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  permit_alert: 'Permit Alerts',
  shuttle: 'Shuttle Services',
  bike_service: 'Bike Shops & Service',
  gear_rental: 'Gear & Rentals',
  guide_service: 'Guides & Outfitters',
  water_sports: 'Water Sports',
  food_drink: 'Food & Coffee',
  accommodation: 'Places to Stay',
  community: 'Community Activity',
};

const SUGGESTION_CATEGORY_ORDER: SuggestionCategory[] = [
  'permit_alert',
  'shuttle',
  'bike_service',
  'guide_service',
  'water_sports',
  'gear_rental',
  'food_drink',
  'accommodation',
  'community',
];

export { SUGGESTION_CATEGORY_LABELS, SUGGESTION_CATEGORY_ORDER };

export function generateSuggestions(
  state: TripState,
  trailData?: any[],
  businessData?: any[],
  postData?: any[],
): TripSuggestion[] {
  const suggestions: TripSuggestion[] = [];
  const usedBusinessIds = new Set<string>();
  const usedPostIds = new Set<string>();

  // Collect all activity types and trail IDs from the itinerary
  const allActivityTypes = new Set<string>();
  const allTrailIds = new Set<string>();
  let hasPointToPoint = false;
  let hasPermitTrail = false;
  const permitTrailNames: string[] = [];

  for (const day of state.days) {
    for (const item of day.items) {
      if (item.type === 'trail' && item.trailId) {
        allTrailIds.add(item.trailId);
        const trail = (trailData ?? []).find((t: any) => t.id === item.trailId);
        if (trail) {
          (trail.activity_types || []).forEach((at: string) => allActivityTypes.add(at));
          if (trail.trail_type === 'point_to_point') {
            hasPointToPoint = true;
          }
          if (trail.requires_permit) {
            hasPermitTrail = true;
            permitTrailNames.push(trail.name);
          }
        }
      }
      if (item.type === 'custom' && item.customActivityType) {
        allActivityTypes.add(item.customActivityType);
      }
    }
  }

  // No items in itinerary yet — return empty
  const totalItems = state.days.reduce((sum, d) => sum + d.items.length, 0);
  if (totalItems === 0) return [];

  // 1. Permit alerts (highest priority)
  if (hasPermitTrail) {
    suggestions.push({
      id: 'sug-permit-alert',
      type: 'permit_alert',
      category: 'permit_alert',
      title: 'Permit Required',
      subtitle: permitTrailNames.join(', '),
      emoji: '\u{1F3AB}',
      reason: `${permitTrailNames[0]} requires a permit. Check the Activity Board for open permit shares.`,
      priority: 1,
    });

    // Find matching open_permit posts
    for (const post of (postData ?? []) as any[]) {
      if (post.post_type === 'open_permit' && !usedPostIds.has(post.id)) {
        usedPostIds.add(post.id);
        suggestions.push({
          id: `sug-post-${post.id}`,
          type: 'activity_post',
          category: 'permit_alert',
          title: post.title,
          subtitle: `${post.user_display_name} \u2022 ${post.permit_slots_available} slot${post.permit_slots_available !== 1 ? 's' : ''} open`,
          emoji: '\u{1F3AB}',
          reason: 'Open permit share on the Activity Board',
          activityPostId: post.id,
          priority: 1,
        });
      }
    }
  }

  // 2. Shuttle services for point-to-point trails
  if (hasPointToPoint) {
    for (const biz of (businessData ?? []) as any[]) {
      if (biz.category === 'bike_shuttle' && !usedBusinessIds.has(biz.id)) {
        usedBusinessIds.add(biz.id);
        suggestions.push({
          id: `sug-biz-${biz.id}`,
          type: 'business',
          category: 'shuttle',
          title: biz.name,
          subtitle: CATEGORY_LABELS[biz.category] || biz.category,
          emoji: CATEGORY_ICONS[biz.category] || '\u{1F4CD}',
          reason: 'Your itinerary includes a point-to-point trail that needs a shuttle',
          businessSlug: biz.slug,
          priority: biz.is_spotlight ? 1 : 2,
          specialOffer: biz.special_offer || undefined,
          isSpotlight: biz.is_spotlight,
        });
      }
    }
  }

  // 3. Match businesses by activity type
  for (const actType of allActivityTypes) {
    const targetCategories = ACTIVITY_TO_BUSINESS_CATEGORIES[actType] || [];
    for (const biz of (businessData ?? []) as any[]) {
      if (usedBusinessIds.has(biz.id)) continue;
      if (targetCategories.includes(biz.category)) {
        usedBusinessIds.add(biz.id);
        suggestions.push({
          id: `sug-biz-${biz.id}`,
          type: 'business',
          category: mapToSuggestionCategory(biz.category),
          title: biz.name,
          subtitle: CATEGORY_LABELS[biz.category] || biz.category,
          emoji: CATEGORY_ICONS[biz.category] || '\u{1F4CD}',
          reason: `Recommended for your ${ACTIVITY_LABELS[actType] || actType} plans`,
          businessSlug: biz.slug,
          priority: biz.is_spotlight ? 2 : 3,
          specialOffer: biz.special_offer || undefined,
          isSpotlight: biz.is_spotlight,
        });
      }
    }
  }

  // 4. Always suggest cafes
  for (const biz of (businessData ?? []) as any[]) {
    if (biz.category === 'trailhead_cafe' && !usedBusinessIds.has(biz.id)) {
      usedBusinessIds.add(biz.id);
      suggestions.push({
        id: `sug-biz-${biz.id}`,
        type: 'business',
        category: 'food_drink',
        title: biz.name,
        subtitle: CATEGORY_LABELS[biz.category] || biz.category,
        emoji: CATEGORY_ICONS[biz.category] || '\u2615',
        reason: 'Fuel up before hitting the trail',
        businessSlug: biz.slug,
        priority: 4,
        specialOffer: biz.special_offer || undefined,
        isSpotlight: biz.is_spotlight,
      });
    }
  }

  // 5. Suggest accommodation for multi-day trips
  if (state.days.length >= 2) {
    for (const biz of (businessData ?? []) as any[]) {
      if (
        (biz.category === 'adventure_hostel' || biz.category === 'camping') &&
        !usedBusinessIds.has(biz.id)
      ) {
        usedBusinessIds.add(biz.id);
        suggestions.push({
          id: `sug-biz-${biz.id}`,
          type: 'business',
          category: 'accommodation',
          title: biz.name,
          subtitle: CATEGORY_LABELS[biz.category] || biz.category,
          emoji: CATEGORY_ICONS[biz.category] || '\u{1F3E0}',
          reason: `${state.days.length}-day trip — you\u2019ll need a place to stay`,
          businessSlug: biz.slug,
          priority: 4,
          specialOffer: biz.special_offer || undefined,
          isSpotlight: biz.is_spotlight,
        });
      }
    }
  }

  // 6. Community activity posts matching trails in itinerary
  for (const post of (postData ?? []) as any[]) {
    if (usedPostIds.has(post.id)) continue;
    if (post.trail_id && allTrailIds.has(post.trail_id)) {
      usedPostIds.add(post.id);
      const trail = (trailData ?? []).find((t: any) => t.id === post.trail_id);
      suggestions.push({
        id: `sug-post-${post.id}`,
        type: 'activity_post',
        category: 'community',
        title: post.title,
        subtitle: `${post.user_display_name} \u2022 ${post.max_participants - post.current_participants} spots left`,
        emoji: post.post_type === 'im_going' ? '\u{1F7E2}' : post.post_type === 'lfg' ? '\u{1F7E3}' : '\u{1F3AB}',
        reason: trail
          ? `Others are planning to ride ${trail.name} too`
          : 'Community activity near your planned trail',
        activityPostId: post.id,
        priority: 5,
      });
    }
  }

  return suggestions.sort((a, b) => a.priority - b.priority);
}
