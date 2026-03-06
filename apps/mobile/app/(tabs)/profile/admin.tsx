import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Users,
  MapPin,
  Store,
  MessageSquare,
  TrendingUp,
  Star,
  Activity,
  ChevronLeft,
  Search,
  ShieldCheck,
  Crown,
  ChevronRight,
  Eye,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  fetchDashboardStats,
  fetchAllUsers,
  grantRole,
  revokeRole,
  fetchAuditLog,
  type AdminStats,
  type AdminUser,
  type AuditLogEntry,
} from '@/lib/admin';

type AdminTab = 'overview' | 'users' | 'audit';

export default function AdminDashboardScreen() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [s, u, a] = await Promise.all([
        fetchDashboardStats(),
        fetchAllUsers(0, 50),
        fetchAuditLog(20),
      ]);
      if (s) setStats(s);
      setUsers(u);
      setAuditLog(a);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSearchUsers = useCallback(async () => {
    try {
      const result = await fetchAllUsers(0, 50, userSearch || undefined);
      setUsers(result);
    } catch {
      // Silently fail
    }
  }, [userSearch]);

  useEffect(() => {
    const timer = setTimeout(handleSearchUsers, 300);
    return () => clearTimeout(timer);
  }, [userSearch, handleSearchUsers]);

  const handleToggleAdmin = (user: AdminUser) => {
    const isAlreadyAdmin = user.roles.includes('admin');
    const action = isAlreadyAdmin ? 'Remove admin' : 'Make admin';

    Alert.alert(
      `${action}?`,
      `${action} role for ${user.email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: isAlreadyAdmin ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (isAlreadyAdmin) {
                await revokeRole(user.user_id, 'admin');
              } else {
                await grantRole(user.user_id, 'admin');
              }
              await handleSearchUsers();
            } catch (err) {
              Alert.alert('Error', 'Failed to update role');
            }
          },
        },
      ],
    );
  };

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.total_users, icon: Users, color: '#818cf8' },
        { label: 'New This Week', value: stats.users_this_week, icon: TrendingUp, color: '#10B981' },
        { label: 'Active Trials', value: stats.active_trials, icon: Crown, color: '#f59e0b' },
        { label: 'Trails', value: stats.total_trails, icon: MapPin, color: '#10B981' },
        { label: 'Businesses', value: stats.total_businesses, icon: Store, color: '#818cf8' },
        { label: 'Board Posts', value: stats.total_activity_posts, icon: MessageSquare, color: '#f59e0b' },
        { label: 'Reviews', value: stats.total_reviews, icon: Star, color: '#fbbf24' },
        { label: 'Recorded', value: stats.total_recorded_activities, icon: Activity, color: '#ef4444' },
      ]
    : [];

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <ChevronLeft size={22} color="#94a3b8" />
        </Pressable>
        <View className="flex-row items-center flex-1">
          <ShieldCheck size={20} color="#ef4444" />
          <Text className="text-slate-100 font-bold text-lg ml-2">
            Admin Dashboard
          </Text>
        </View>
      </View>

      {/* Tab bar */}
      <View className="flex-row px-4 pt-3 gap-2">
        {(['overview', 'users', 'audit'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`px-4 py-2 rounded-full ${
              tab === t ? 'bg-canopy' : 'bg-cairn-card border border-cairn-border'
            }`}
          >
            <Text
              className={`text-xs font-medium capitalize ${
                tab === t ? 'text-white' : 'text-slate-400'
              }`}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Overview tab */}
      {tab === 'overview' && (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
            />
          }
        >
          {loading ? (
            <Text className="text-slate-500 text-center mt-8">Loading stats...</Text>
          ) : (
            <>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {statCards.map((s) => (
                  <View key={s.label} style={{ minWidth: '46%', flex: 1 }}>
                  <Card className="flex-1">
                    <View className="flex-row items-center gap-2 mb-2">
                      <View
                        className="w-8 h-8 rounded-lg items-center justify-center"
                        style={{ backgroundColor: s.color + '20' }}
                      >
                        <s.icon size={16} color={s.color} />
                      </View>
                      <Text className="text-slate-500 text-xs">{s.label}</Text>
                    </View>
                    <Text className="text-slate-100 font-bold text-2xl">
                      {s.value.toLocaleString()}
                    </Text>
                  </Card>
                  </View>
                ))}
              </View>

              {/* Quick actions */}
              <Text className="text-slate-100 font-semibold text-base mb-3">
                Quick Actions
              </Text>
              <View className="gap-2 mb-6">
                <Pressable
                  onPress={() => setTab('users')}
                  className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl px-4 py-3"
                >
                  <Users size={16} color="#818cf8" />
                  <Text className="text-slate-100 text-sm font-medium ml-3 flex-1">
                    Manage Users & Roles
                  </Text>
                  <ChevronRight size={16} color="#64748b" />
                </Pressable>
                <Pressable
                  onPress={() => {/* TODO: navigate to business management */}}
                  className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl px-4 py-3"
                >
                  <Store size={16} color="#10B981" />
                  <Text className="text-slate-100 text-sm font-medium ml-3 flex-1">
                    Business Verification
                  </Text>
                  <ChevronRight size={16} color="#64748b" />
                </Pressable>
                <Pressable
                  onPress={() => setTab('audit')}
                  className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl px-4 py-3"
                >
                  <Eye size={16} color="#f59e0b" />
                  <Text className="text-slate-100 text-sm font-medium ml-3 flex-1">
                    View Audit Log
                  </Text>
                  <ChevronRight size={16} color="#64748b" />
                </Pressable>
              </View>
            </>
          )}
          <View className="h-20" />
        </ScrollView>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <View className="flex-1 px-4 pt-4">
          <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-10 px-3 mb-3">
            <Search size={14} color="#64748b" />
            <TextInput
              value={userSearch}
              onChangeText={setUserSearch}
              placeholder="Search by email..."
              placeholderTextColor="#475569"
              style={styles.searchInput}
            />
          </View>

          <FlatList
            data={users}
            keyExtractor={(u) => u.user_id}
            renderItem={({ item }) => (
              <Card className="mb-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-slate-100 text-sm font-medium" numberOfLines={1}>
                      {item.email}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            item.plan === 'trial' ? '#10B98120' :
                            item.plan === 'pro' ? '#818cf820' :
                            '#64748b20',
                        }}
                      >
                        <Text
                          className="text-[10px] font-medium capitalize"
                          style={{
                            color:
                              item.plan === 'trial' ? '#10B981' :
                              item.plan === 'pro' ? '#818cf8' :
                              '#64748b',
                          }}
                        >
                          {item.plan}
                        </Text>
                      </View>
                      {item.roles.includes('admin') && (
                        <View className="px-2 py-0.5 rounded-full bg-red-500/20">
                          <Text className="text-[10px] font-medium text-red-400">Admin</Text>
                        </View>
                      )}
                      <Text className="text-slate-500 text-[10px]">
                        {item.activity_count} activities
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleToggleAdmin(item)}
                    className="p-2 bg-cairn-elevated rounded-lg"
                  >
                    <ShieldCheck
                      size={16}
                      color={item.roles.includes('admin') ? '#ef4444' : '#64748b'}
                    />
                  </Pressable>
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <Text className="text-slate-500 text-center mt-8">
                No users found
              </Text>
            }
          />
        </View>
      )}

      {/* Audit log tab */}
      {tab === 'audit' && (
        <FlatList
          data={auditLog}
          keyExtractor={(entry) => entry.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Card className="mb-2">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-6 h-6 rounded-full bg-cairn-elevated items-center justify-center">
                  <Activity size={12} color="#94a3b8" />
                </View>
                <Text className="text-slate-100 text-sm font-medium flex-1">
                  {item.action.replace(/_/g, ' ')}
                </Text>
              </View>
              {item.target_type && (
                <Text className="text-slate-500 text-xs ml-8">
                  {item.target_type}: {item.target_id?.slice(0, 8)}...
                </Text>
              )}
              <Text className="text-slate-600 text-[10px] ml-8 mt-1">
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </Card>
          )}
          ListEmptyComponent={
            <Text className="text-slate-500 text-center mt-8">
              No audit log entries yet
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#f1f5f9',
  },
});
