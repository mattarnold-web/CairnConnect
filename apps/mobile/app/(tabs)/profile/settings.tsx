import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Ruler,
  Bell,
  BellOff,
  Shield,
  Navigation,
  Trash2,
  LogOut,
  Info,
  Database,
  Gauge,
  Pause,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmergencyContact } from '@/components/safety/EmergencyContact';
import { usePreferences } from '@/lib/preferences-context';
import { useAuth } from '@/lib/auth-context';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestPushPermissions,
  type NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFS,
} from '@/lib/notifications';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

// ---------------------------------------------------------------------------
// Activity recording settings
// ---------------------------------------------------------------------------

interface RecordingSettings {
  gpsAccuracy: 'high' | 'balanced' | 'low';
  autoPause: boolean;
}

const RECORDING_SETTINGS_KEY = 'cairn-recording-settings';
const DEFAULT_RECORDING_SETTINGS: RecordingSettings = {
  gpsAccuracy: 'high',
  autoPause: false,
};

// ---------------------------------------------------------------------------
// Toggle Row component
// ---------------------------------------------------------------------------

function ToggleRow({
  icon: Icon,
  iconColor,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1 mr-3">
        <Icon size={16} color={iconColor} />
        <View className="ml-3 flex-1">
          <Text className="text-slate-200 text-sm">{label}</Text>
          {description && (
            <Text className="text-slate-500 text-xs mt-0.5">{description}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#1e293b', true: '#10B981' }}
        thumbColor="white"
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Settings Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const { preferences, dispatch: prefsDispatch } = usePreferences();
  const { user, signOut } = useAuth();

  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS);
  const [recordingSettings, setRecordingSettings] = useState<RecordingSettings>(DEFAULT_RECORDING_SETTINGS);
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');

  // Load saved preferences
  useEffect(() => {
    getNotificationPreferences().then(setNotifPrefs);
    loadFromStorage<RecordingSettings>(RECORDING_SETTINGS_KEY).then((saved) => {
      if (saved) setRecordingSettings(saved);
    });
    estimateCacheSize();
  }, []);

  const estimateCacheSize = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) totalSize += value.length;
      }
      const kb = Math.round(totalSize / 1024);
      setCacheSize(kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`);
    } catch {
      setCacheSize('Unknown');
    }
  };

  const updateNotifPrefs = (update: Partial<NotificationPreferences>) => {
    const updated = { ...notifPrefs, ...update };
    setNotifPrefs(updated);
    saveNotificationPreferences(updated);
  };

  const handleEnablePush = async () => {
    const token = await requestPushPermissions();
    if (token) {
      updateNotifPrefs({ enabled: true });
      Alert.alert('Push Enabled', 'Push notifications are now enabled.');
    } else {
      Alert.alert('Permission Denied', 'Enable notifications in your device settings.');
    }
  };

  const updateRecordingSettings = (update: Partial<RecordingSettings>) => {
    const updated = { ...recordingSettings, ...update };
    setRecordingSettings(updated);
    saveToStorage(RECORDING_SETTINGS_KEY, updated);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache?',
      'This will remove cached data but not your activities or settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const keysToKeep = [
                'cairn-preferences',
                'cairn-activities',
                'cairn-emergency-contact',
                'cairn-notification-prefs',
                'cairn-push-token',
                'cairn-recording-settings',
              ];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter((k) => !keysToKeep.includes(k));
              await AsyncStorage.multiRemove(keysToRemove);
              await estimateCacheSize();
              Alert.alert('Done', 'Cache cleared successfully.');
            } catch {
              Alert.alert('Error', 'Could not clear cache.');
            }
          },
        },
      ],
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out?', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type DELETE in the next prompt to confirm. This cannot be reversed.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'I Understand, Delete',
                  style: 'destructive',
                  onPress: async () => {
                    // In production, call API to delete account
                    await signOut();
                    router.replace('/(auth)/login');
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const GPS_ACCURACY_OPTIONS: { value: RecordingSettings['gpsAccuracy']; label: string }[] = [
    { value: 'high', label: 'High' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={20} color="#e2e8f0" />
          </Pressable>
          <Text className="text-slate-100 font-bold text-xl">Settings</Text>
        </View>

        {/* ---- Units ---- */}
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          Preferences
        </Text>
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ruler size={16} color="#10B981" />
              <Text className="text-slate-200 text-sm ml-3">Units</Text>
            </View>
            <View className="flex-row">
              <Pressable
                onPress={() => prefsDispatch({ type: 'SET_UNITS', units: 'imperial' })}
                className={`px-3 py-1.5 rounded-l-lg ${
                  preferences.units === 'imperial' ? 'bg-canopy' : 'bg-cairn-elevated'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    preferences.units === 'imperial' ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  Imperial
                </Text>
              </Pressable>
              <Pressable
                onPress={() => prefsDispatch({ type: 'SET_UNITS', units: 'metric' })}
                className={`px-3 py-1.5 rounded-r-lg ${
                  preferences.units === 'metric' ? 'bg-canopy' : 'bg-cairn-elevated'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    preferences.units === 'metric' ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  Metric
                </Text>
              </Pressable>
            </View>
          </View>
        </Card>

        {/* ---- Emergency Contact ---- */}
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          Safety
        </Text>
        <View className="mb-4">
          <EmergencyContact />
        </View>

        {/* ---- Notifications ---- */}
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          Notifications
        </Text>
        <Card className="mb-4">
          <ToggleRow
            icon={Bell}
            iconColor="#10B981"
            label="Push Notifications"
            description="Enable push notifications"
            value={notifPrefs.enabled}
            onValueChange={(val) => {
              if (val) {
                handleEnablePush();
              } else {
                updateNotifPrefs({ enabled: false });
              }
            }}
          />
          <View className="border-t border-cairn-border" />
          <ToggleRow
            icon={Bell}
            iconColor="#3b82f6"
            label="Trip Reminders"
            description="Notify before upcoming trips"
            value={notifPrefs.tripReminders}
            onValueChange={(val) => updateNotifPrefs({ tripReminders: val })}
          />
          <View className="border-t border-cairn-border" />
          <ToggleRow
            icon={Bell}
            iconColor="#a855f7"
            label="Board Replies"
            description="Notify on replies to your posts"
            value={notifPrefs.boardReplies}
            onValueChange={(val) => updateNotifPrefs({ boardReplies: val })}
          />
          <View className="border-t border-cairn-border" />
          <ToggleRow
            icon={Bell}
            iconColor="#f59e0b"
            label="Weather Alerts"
            description="Severe weather near saved trails"
            value={notifPrefs.weatherAlerts}
            onValueChange={(val) => updateNotifPrefs({ weatherAlerts: val })}
          />
        </Card>

        {/* ---- Activity Recording ---- */}
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          Activity Recording
        </Text>
        <Card className="mb-4">
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center flex-1 mr-3">
              <Gauge size={16} color="#10B981" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-200 text-sm">GPS Accuracy</Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  Higher accuracy uses more battery
                </Text>
              </View>
            </View>
            <View className="flex-row">
              {GPS_ACCURACY_OPTIONS.map((opt, idx) => (
                <Pressable
                  key={opt.value}
                  onPress={() => updateRecordingSettings({ gpsAccuracy: opt.value })}
                  className={`px-2.5 py-1.5 ${
                    idx === 0
                      ? 'rounded-l-lg'
                      : idx === GPS_ACCURACY_OPTIONS.length - 1
                        ? 'rounded-r-lg'
                        : ''
                  } ${
                    recordingSettings.gpsAccuracy === opt.value
                      ? 'bg-canopy'
                      : 'bg-cairn-elevated'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      recordingSettings.gpsAccuracy === opt.value
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="border-t border-cairn-border" />
          <ToggleRow
            icon={Pause}
            iconColor="#f59e0b"
            label="Auto-Pause"
            description="Pause recording when stationary"
            value={recordingSettings.autoPause}
            onValueChange={(val) => updateRecordingSettings({ autoPause: val })}
          />
        </Card>

        {/* ---- Cache Management ---- */}
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          Storage
        </Text>
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Database size={16} color="#64748b" />
              <View className="ml-3">
                <Text className="text-slate-200 text-sm">Cached Data</Text>
                <Text className="text-slate-500 text-xs">{cacheSize}</Text>
              </View>
            </View>
            <Pressable
              onPress={handleClearCache}
              className="px-3 py-1.5 bg-cairn-elevated rounded-lg active:bg-cairn-card-hover"
            >
              <Text className="text-slate-400 text-xs font-medium">Clear</Text>
            </Pressable>
          </View>
        </Card>

        {/* ---- About ---- */}
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          About
        </Text>
        <Card className="mb-4">
          <View className="flex-row items-center">
            <Info size={16} color="#64748b" />
            <View className="ml-3 flex-1">
              <Text className="text-slate-200 text-sm">Cairn Connect</Text>
              <Text className="text-slate-500 text-xs">Version 1.0.0</Text>
            </View>
          </View>
        </Card>

        {/* ---- Account actions ---- */}
        <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          Account
        </Text>
        <View className="gap-3">
          {user && (
            <Button variant="secondary" size="lg" onPress={handleSignOut}>
              <View className="flex-row items-center">
                <LogOut size={16} color="#94a3b8" />
                <Text className="text-slate-300 font-medium text-sm ml-2">
                  Sign Out
                </Text>
              </View>
            </Button>
          )}

          {user && (
            <Button variant="destructive" size="lg" onPress={handleDeleteAccount}>
              <View className="flex-row items-center">
                <Trash2 size={16} color="white" />
                <Text className="text-white font-semibold text-sm ml-2">
                  Delete Account
                </Text>
              </View>
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
