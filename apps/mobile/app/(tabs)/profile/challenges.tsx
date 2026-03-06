import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Flame,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface LeaderboardEntry {
  user_id: string;
  email: string;
  current_value: number;
  rank: number;
}

interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_emoji: string;
  criteria_type: string;
  criteria_value: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

// Built-in badges for when the DB doesn't have any
const DEFAULT_BADGES: Badge[] = [
  { id: 'b1', slug: '100-miles', name: '100 Mile Club', description: 'Log 100 miles of activity', icon_emoji: '🏅', criteria_type: 'distance', criteria_value: 160934 },
  { id: 'b2', slug: 'early-bird', name: 'Early Bird', description: 'Record 5 activities before 7 AM', icon_emoji: '🌅', criteria_type: 'count', criteria_value: 5 },
  { id: 'b3', slug: 'trail-steward', name: 'Trail Steward', description: 'Leave 10 trail reviews', icon_emoji: '🌿', criteria_type: 'reviews', criteria_value: 10 },
  { id: 'b4', slug: 'summit-seeker', name: 'Summit Seeker', description: 'Gain 50,000 ft of elevation', icon_emoji: '⛰️', criteria_type: 'elevation', criteria_value: 15240 },
  { id: 'b5', slug: 'social-butterfly', name: 'Social Butterfly', description: 'Join 5 community activities', icon_emoji: '🦋', criteria_type: 'social', criteria_value: 5 },
  { id: 'b6', slug: 'explorer', name: 'Explorer', description: 'Visit 10 different trails', icon_emoji: '🧭', criteria_type: 'trails', criteria_value: 10 },
  { id: 'b7', slug: 'streak-7', name: 'Week Warrior', description: '7-day activity streak', icon_emoji: '🔥', criteria_type: 'streak', criteria_value: 7 },
  { id: 'b8', slug: 'photographer', name: 'Shutterbug', description: 'Take 50 trail photos', icon_emoji: '📸', criteria_type: 'photos', criteria_value: 50 },
];

export default function ChallengesScreen() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myProgress, setMyProgress] = useState<Record<string, number>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // Try to fetch challenges from DB
      const sb = supabase as any;
      const { data: challengeData } = await sb
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .limit(5);

      if (challengeData?.length) {
        setChallenges(challengeData);

        // Fetch user's progress
        if (user?.id && challengeData[0]) {
          const { data: participants } = await sb
            .from('challenge_participants')
            .select('challenge_id, current_value')
            .eq('user_id', user.id);

          if (participants) {
            const progress: Record<string, number> = {};
            for (const p of participants) {
              progress[p.challenge_id] = p.current_value;
            }
            setMyProgress(progress);
          }

          // Fetch leaderboard for first challenge
          const { data: lb } = await sb
            .from('challenge_participants')
            .select('user_id, current_value')
            .eq('challenge_id', challengeData[0].id)
            .order('current_value', { ascending: false })
            .limit(10);

          if (lb) {
            setLeaderboard(
              lb.map((entry: any, i: number) => ({
                ...entry,
                email: entry.user_id === user?.id ? user.email ?? 'You' : `Hiker ${i + 1}`,
                rank: i + 1,
              }))
            );
          }
        }
      } else {
        // No challenges in DB yet - show placeholder challenge
        setChallenges([{
          id: 'demo-1',
          title: 'March Distance Challenge',
          description: 'Log 100 miles of outdoor activity this month',
          challenge_type: 'distance',
          target_value: 100,
          unit: 'miles',
          start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
          is_active: true,
        }]);
      }

      // Fetch badges
      const { data: badgeData } = await sb.from('badges').select('*');
      if (badgeData?.length) {
        setBadges(badgeData);
      }

      // Fetch earned badges
      if (user?.id) {
        const { data: userBadgeData } = await sb
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', user.id);

        if (userBadgeData) {
          setEarnedBadges(new Set(userBadgeData.map((b: UserBadge) => b.badge_id)));
        }
      }
    } catch {
      // DB tables may not exist yet - use defaults
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const daysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#071019' }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ padding: 4, marginRight: 12 }}>
          <ArrowLeft size={24} color="#e2e8f0" />
        </Pressable>
        <Trophy size={20} color="#fbbf24" />
        <Text style={styles.headerTitle}>Challenges</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {/* Active Challenge */}
        {challenges[0] && (
          <Card className="mb-4">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Flame size={18} color="#f97316" />
              <Text style={{ color: '#e2e8f0', fontSize: 16, fontWeight: '700', flex: 1 }}>
                {challenges[0].title}
              </Text>
              <View style={styles.daysTag}>
                <Calendar size={10} color="#64748b" />
                <Text style={{ color: '#94a3b8', fontSize: 10, marginLeft: 4 }}>
                  {daysRemaining(challenges[0].end_date)}d left
                </Text>
              </View>
            </View>

            <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
              {challenges[0].description}
            </Text>

            {/* Progress bar */}
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#10B981', fontSize: 20, fontWeight: '700' }}>
                  {myProgress[challenges[0].id] ?? 0}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 13 }}>
                  / {challenges[0].target_value} {challenges[0].unit}
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, ((myProgress[challenges[0].id] ?? 0) / challenges[0].target_value) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </Card>
        )}

        {/* Leaderboard */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Users size={16} color="#10B981" />
            <Text style={{ color: '#e2e8f0', fontSize: 16, fontWeight: '700' }}>
              Leaderboard
            </Text>
          </View>

          {leaderboard.length > 0 ? (
            leaderboard.map((entry) => (
              <View
                key={entry.user_id}
                style={[
                  styles.leaderboardRow,
                  entry.user_id === user?.id && styles.leaderboardRowSelf,
                ]}
              >
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                  </Text>
                </View>
                <Text style={{ color: entry.user_id === user?.id ? '#10B981' : '#e2e8f0', fontSize: 13, fontWeight: '500', flex: 1 }}>
                  {entry.user_id === user?.id ? 'You' : entry.email}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={12} color="#10B981" />
                  <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '600' }}>
                    {entry.current_value}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Card>
              <Text style={{ color: '#475569', fontSize: 13, textAlign: 'center' }}>
                Join a challenge to see the leaderboard
              </Text>
            </Card>
          )}
        </View>

        {/* Achievement Badges */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Award size={16} color="#fbbf24" />
            <Text style={{ color: '#e2e8f0', fontSize: 16, fontWeight: '700' }}>
              Badges
            </Text>
          </View>

          <View style={styles.badgeGrid}>
            {badges.map((badge) => {
              const earned = earnedBadges.has(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, earned && styles.badgeCardEarned]}
                >
                  <Text style={{ fontSize: 28, marginBottom: 4, opacity: earned ? 1 : 0.3 }}>
                    {badge.icon_emoji}
                  </Text>
                  <Text
                    style={{
                      color: earned ? '#e2e8f0' : '#475569',
                      fontSize: 11,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {badge.name}
                  </Text>
                  <Text
                    style={{
                      color: earned ? '#94a3b8' : '#334155',
                      fontSize: 9,
                      textAlign: 'center',
                      marginTop: 2,
                    }}
                    numberOfLines={2}
                  >
                    {badge.description}
                  </Text>
                  {earned && (
                    <View style={styles.earnedIndicator}>
                      <Text style={{ fontSize: 8 }}>✓</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
    gap: 8,
  },
  headerTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  daysTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2337',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#1E3A5F',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2337',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    gap: 10,
  },
  leaderboardRowSelf: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  rankBadge: {
    width: 28,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '30%',
    backgroundColor: '#0F2337',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  badgeCardEarned: {
    borderColor: 'rgba(251, 191, 36, 0.3)',
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
  },
  earnedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
