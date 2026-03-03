export interface ActivityPost {
  id: string;
  user_id: string;
  post_type: PostType;
  activity_type: string;
  title: string;
  description: string | null;
  location_name: string | null;
  lat: number;
  lng: number;
  trail_id: string | null;
  activity_date: string;
  activity_end_date: string | null;
  skill_level: SkillLevel;
  max_participants: number;
  current_participants: number;
  permit_required: boolean;
  permit_type: string | null;
  permit_slots_available: number | null;
  cost_share: number | null;
  gear_required: string[];
  contact_method: 'in_app' | 'email' | 'phone';
  status: 'active' | 'full' | 'cancelled' | 'completed';
  view_count: number;
  created_at: string;
  // Joined fields
  user_display_name?: string;
  user_avatar?: string;
  distance_km?: number;
}

export type PostType = 'im_going' | 'open_permit' | 'lfg';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const POST_TYPE_LABELS: Record<PostType, string> = {
  im_going: "I'm Going",
  open_permit: 'Open Permit',
  lfg: 'Looking for Group',
};

export const POST_TYPE_COLORS: Record<PostType, string> = {
  im_going: '#10B981',
  open_permit: '#F59E0B',
  lfg: '#8B5CF6',
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};
