import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Lock,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Mock data for connected devices
// ---------------------------------------------------------------------------

interface DeviceConnection {
  id: string;
  name: string;
  letterColor: string;
  connected: boolean;
  locked?: boolean;
  details: string[];
  hasToggle?: boolean;
  hasDisconnect?: boolean;
  upgradeLabel?: string;
}

const DEVICES: DeviceConnection[] = [
  {
    id: 'strava',
    name: 'Strava',
    letterColor: '#FC4C02',
    connected: true,
    details: ['Last sync: 2 hours ago', '23 activities synced'],
    hasDisconnect: true,
  },
  {
    id: 'garmin',
    name: 'Garmin',
    letterColor: '#007CC3',
    connected: true,
    details: ['Push trails to device enabled'],
    hasToggle: true,
  },
  {
    id: 'apple-health',
    name: 'Apple Health',
    letterColor: '#FF2D55',
    connected: true,
    details: ['Syncing workouts + heart rate'],
    hasToggle: true,
  },
  {
    id: 'terra-api',
    name: 'Terra API',
    letterColor: '#6366F1',
    connected: false,
    locked: true,
    details: ['Connect 30+ Devices', 'Wahoo, Polar, Suunto, Oura...'],
    upgradeLabel: 'Upgrade to Pro',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DeviceConnectionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={20} color="#e2e8f0" />
          </Pressable>
          <Text className="text-slate-100 font-bold text-xl">
            Device Connections
          </Text>
        </View>

        {/* Device cards */}
        {DEVICES.map((device) => (
          <Pressable key={device.id} className="mb-3">
            <Card>
              {/* Top row: logo circle, name, badge */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  {device.locked ? (
                    <View className="h-10 w-10 rounded-full bg-slate-700 items-center justify-center mr-3">
                      <Lock size={18} color="#94a3b8" />
                    </View>
                  ) : (
                    <View
                      className="h-10 w-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: device.letterColor }}
                    >
                      <Text className="text-white font-bold text-base">
                        {device.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text className="text-slate-100 font-semibold text-base">
                    {device.name}
                  </Text>
                </View>
                {device.connected && (
                  <View className="rounded-full bg-emerald-500/20 px-3 py-1 flex-row items-center gap-1">
                    <Check size={12} color="#10B981" />
                    <Text className="text-emerald-400 text-xs font-semibold">
                      Connected
                    </Text>
                  </View>
                )}
              </View>

              {/* Detail lines */}
              {device.details.map((detail, idx) => (
                <View key={idx} className="flex-row items-center mb-1.5">
                  {device.hasToggle && (
                    <Check size={12} color="#10B981" className="mr-1.5" />
                  )}
                  <Text className="text-slate-400 text-sm">
                    {device.hasToggle ? ` ${detail}` : detail}
                  </Text>
                </View>
              ))}

              {/* Action button */}
              {device.hasDisconnect && (
                <Button variant="secondary" size="sm" className="mt-3 self-start">
                  <Text className="text-slate-300 text-xs font-medium">
                    Disconnect
                  </Text>
                </Button>
              )}

              {device.upgradeLabel && (
                <Button variant="primary" size="md" className="mt-3">
                  <Text className="text-white text-sm font-semibold">
                    {device.upgradeLabel}
                  </Text>
                </Button>
              )}
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
