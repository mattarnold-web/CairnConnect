export interface User {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location_name: string | null;
  activity_preferences: string[];
  preferred_skill_level: SkillLevel | null;
  skill_levels: Record<string, string>;
  is_pro_subscriber: boolean;
  pro_expires_at: string | null;
  preferred_units: 'imperial' | 'metric';
  preferred_language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
