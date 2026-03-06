import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Activity,
  Watch,
  Heart,
  Zap,
  Check,
  RefreshCw,
  Unlink,
  MapPin,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { useFormat } from '@/lib/use-format';
import {
  type FitnessPlatform,
  type FitnessConnection,
  type FitnessStats,
  PLATFORM_CONFIGS,
  PLATFORM_ORDER,
  connectPlatform,
  disconnectPlatform,
  syncActivities,
  fetchConnections,
  fetchFitnessStats,
  updateSyncConfig,
} from '@/lib/fitness';

// ---------------------------------------------------------------------------
// Icon mapping — lucide icons for each platform
// ---------------------------------------------------------------------------

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  Activity,
  Watch,
  Heart,
  Zap,
};

function getPlatformIcon(iconName: string): React.ElementType {
  return PLATFORM_ICONS[iconName] ?? Activity;
}

// ---------------------------------------------------------------------------
// Platform Card Component
// ---------------------------------------------------------------------------

function PlatformCard({
  platform,
  connection,
  onConnect,
  onDisconnect,
  onSync,
  onToggleAutoImport,
  connecting,
  syncing,
  fmt,
}: {
  platform: FitnessPlatform;
  connection: FitnessConnection | null;
  onConnect: (p: FitnessPlatform) => void;
  onDisconnect: (connId: string, name: string) => void;
  onSync: (connId: string) => void;
  onToggleAutoImport: (connId: string, value: boolean) => void;
  connecting: boolean;
  syncing: boolean;
  fmt: ReturnType<typeof useFormat>;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = PLATFORM_CONFIGS[platform];
  const Icon = getPlatformIcon(config.iconName);
  const isConnected = !!connection;

  return (
    <Card className="mb-3">
      <Pressable
        onPress={() => isConnected && setExpanded(!expanded)}
        className="flex-row items-center"
      >
        {/* Platform icon */}
        <View
          className="h-10 w-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={20} color={config.color} />
        </View>

        {/* Platform info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-slate-100 font-semibold text-sm">
              {config.name}
            </Text>
            {isConnected && (
              <View className="ml-2 flex-row items-center bg-canopy/20 px-2 py-0.5 rounded-full">
                <Check size={10} color="#10B981" />
                <Text className="text-canopy text-[10px] font-medium ml-1">
                  Connected
                </Text>
              </View>
            )}
          </View>
          <Text className="text-slate-500 text-xs mt-0.5">
            {config.description}
          </Text>
          {isConnected && connection.last_synced_at && (
            <Text className="text-slate-600 text-[10px] mt-0.5">
              Last synced: {formatTimeAgo(connection.last_synced_at)}
            </Text>
          )}
        </View>

        {/* Connect button or expand chevron */}
        {!isConnected ? (
          <Button
            variant="primary"
            size="sm"
            onPress={() => onConnect(platform)}
            loading={connecting}
            disabled={connecting}
          >
            Connect
          </Button>
        ) : (
          <View className="p-2">
            {expanded ? (
              <ChevronUp size={16} color="#64748b" />
            ) : (
              <ChevronDown size={16} color="#64748b" />
            )}
          </View>
        )}
      </Pressable>

      {/* Expanded connection management */}
      {isConnected && expanded && (
        <View className="mt-3 pt-3 border-t border-cairn-border">
          {/* Auto-import toggle */}
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center flex-1 mr-3">
              <Text className="text-slate-300 text-sm">Auto-import</Text>
              <Text className="text-slate-600 text-xs ml-2">
                Sync new activities automatically
              </Text>
            </View>
            <Switch
              value={connection.sync_config?.auto_import ?? true}
              onValueChange={(val) => onToggleAutoImport(connection.id, val)}
              trackColor={{ false: '#1e293b', true: '#10B981' }}
              thumbColor="white"
            />
          </View>

          {/* Action buttons */}
          <View className="flex-row gap-2 mt-2">
            <Pressable
              onPress={() => onSync(connection.id)}
              disabled={syncing}
              className="flex-1 flex-row items-center justify-center bg-cairn-elevated rounded-xl py-2.5 active:bg-cairn-card-hover"
            >
              {syncing ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <>
                  <RefreshCw size={14} color="#10B981" />
                  <Text className="text-canopy text-xs font-medium ml-2">
                    Sync Now
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() => onDisconnect(connection.id, config.name)}
              className="flex-1 flex-row items-center justify-center bg-cairn-elevated rounded-xl py-2.5 active:bg-cairn-card-hover"
            >
              <Unlink size={14} color="#ef4444" />
              <Text className="text-red-400 text-xs font-medium ml-2">
                Disconnect
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Time formatting helper
// ---------------------------------------------------------------------------

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Connected Apps Screen
// ---------------------------------------------------------------------------

export default function ConnectedAppsScreen() {
  const { user } = useAuth();
  const fmt = useFormat();
  const [connections, setConnections] = useState<FitnessConnection[]>([]);
  const [stats, setStats] = useState<FitnessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectingPlatform, setConnectingPlatform] =
    useState<FitnessPlatform | null>(null);
  const [syncingConnection, setSyncingConnection] = useState<string | null>(
    null,
  );

  // Fetch connections and stats
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [conns, fitnessStats] = await Promise.all([
        fetchConnections(),
        fetchFitnessStats(),
      ]);
      setConnections(conns);
      setStats(fitnessStats);
    } catch {
      // Silently fail — tables may not exist yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Find connection for a platform
  const getConnection = (platform: FitnessPlatform) =>
    connections.find((c) => c.platform === platform) ?? null;

  // Handle connect
  const handleConnect = async (platform: FitnessPlatform) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to connect fitness apps.');
      return;
    }

    setConnectingPlatform(platform);
    const { success, error } = await connectPlatform(platform);
    setConnectingPlatform(null);

    if (success) {
      Alert.alert('Connected', `${PLATFORM_CONFIGS[platform].name} connected successfully.`);
      await loadData();
    } else if (error) {
      Alert.alert('Connection Failed', error);
    }
  };

  // Handle disconnect
  const handleDisconnect = (connectionId: string, platformName: string) => {
    Alert.alert(
      `Disconnect ${platformName}?`,
      'Your imported activities will be kept, but no new activities will be synced.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectPlatform(connectionId);
              await loadData();
            } catch {
              Alert.alert('Error', 'Failed to disconnect. Please try again.');
            }
          },
        },
      ],
    );
  };

  // Handle sync
  const handleSync = async (connectionId: string) => {
    setSyncingConnection(connectionId);
    const { imported, error } = await syncActivities(connectionId);
    setSyncingConnection(null);

    if (error) {
      Alert.alert('Sync Failed', error);
    } else {
      Alert.alert('Sync Complete', `${imported} activities imported.`);
      await loadData();
    }
  };

  // Handle auto-import toggle
  const handleToggleAutoImport = async (
    connectionId: string,
    value: boolean,
  ) => {
    try {
      await updateSyncConfig(connectionId, { auto_import: value });
      // Optimistic update
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId
            ? { ...c, sync_config: { ...c.sync_config, auto_import: value } }
            : c,
        ),
      );
    } catch {
      Alert.alert('Error', 'Failed to update setting.');
    }
  };

  const connectedCount = connections.length;

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2 mr-2"
          >
            <ArrowLeft size={20} color="#e2e8f0" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-slate-100 font-bold text-xl">
              Connected Apps
            </Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              {connectedCount > 0
                ? `${connectedCount} app${connectedCount !== 1 ? 's' : ''} connected`
                : 'Import activities from your fitness apps'}
            </Text>
          </View>
        </View>

        {/* Stats summary (only shown if there are imported activities) */}
        {stats && stats.totalActivities > 0 && (
          <View className="mb-4">
            <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
              Imported Stats
            </Text>
            <View className="flex-row gap-2 mb-2">
              <Card className="flex-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <Activity size={10} color="#10B981" />
                  <Text className="text-slate-500 text-[10px]">
                    Activities
                  </Text>
                </View>
                <Text className="text-canopy font-bold text-base">
                  {stats.totalActivities}
                </Text>
              </Card>
              <Card className="flex-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <MapPin size={10} color="#64748b" />
                  <Text className="text-slate-500 text-[10px]">Distance</Text>
                </View>
                <Text className="text-slate-100 font-bold text-base">
                  {fmt.distance(stats.totalDistanceMeters)}
                </Text>
              </Card>
            </View>
            <View className="flex-row gap-2">
              <Card className="flex-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <TrendingUp size={10} color="#10B981" />
                  <Text className="text-slate-500 text-[10px]">Elevation</Text>
                </View>
                <Text className="text-canopy font-bold text-base">
                  {fmt.elevation(stats.totalElevationMeters)}
                </Text>
              </Card>
              <Card className="flex-1">
                <View className="flex-row items-center gap-1 mb-1">
                  <Heart size={10} color="#ef4444" />
                  <Text className="text-slate-500 text-[10px]">Calories</Text>
                </View>
                <Text className="text-slate-100 font-bold text-base">
                  {stats.totalCalories > 0
                    ? stats.totalCalories.toLocaleString()
                    : '--'}
                </Text>
              </Card>
            </View>
          </View>
        )}

        {/* Platform list */}
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          Fitness Platforms
        </Text>

        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-slate-500 text-sm mt-3">
              Loading connections...
            </Text>
          </View>
        ) : (
          PLATFORM_ORDER.map((platform) => (
            <PlatformCard
              key={platform}
              platform={platform}
              connection={getConnection(platform)}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              onToggleAutoImport={handleToggleAutoImport}
              connecting={connectingPlatform === platform}
              syncing={syncingConnection === getConnection(platform)?.id}
              fmt={fmt}
            />
          ))
        )}

        {/* Info footer */}
        <View className="mt-4 px-2">
          <Text className="text-slate-600 text-xs text-center leading-4">
            Connected apps sync outdoor activities like hiking, trail running,
            mountain biking, and more. Your data is stored securely and only
            visible to you.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
