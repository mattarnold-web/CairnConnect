import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Camera, Bell, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as CameraModule from 'expo-camera';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface PermissionCard {
  id: string;
  title: string;
  description: string;
  icon: typeof MapPin;
  accentColor: string;
  accentBg: string;
}

const PERMISSION_CARDS: PermissionCard[] = [
  {
    id: 'location',
    title: 'Location',
    description: 'Find nearby trails and businesses',
    icon: MapPin,
    accentColor: '#F59E0B',
    accentBg: '#F59E0B1A',
  },
  {
    id: 'camera',
    title: 'Camera',
    description: 'Capture trail photos',
    icon: Camera,
    accentColor: '#3B82F6',
    accentBg: '#3B82F61A',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Get activity updates',
    icon: Bell,
    accentColor: '#8B5CF6',
    accentBg: '#8B5CF61A',
  },
];

export default function PermissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [locationStatus, setLocationStatus] = useState<PermissionStatus>('undetermined');
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('undetermined');
  const [notificationStatus, setNotificationStatus] = useState<PermissionStatus>('undetermined');

  const getStatus = (id: string): PermissionStatus => {
    switch (id) {
      case 'location':
        return locationStatus;
      case 'camera':
        return cameraStatus;
      case 'notifications':
        return notificationStatus;
      default:
        return 'undetermined';
    }
  };

  // Check existing permissions on mount
  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      const { status: locStatus } = await Location.getForegroundPermissionsAsync();
      setLocationStatus(locStatus === 'granted' ? 'granted' : locStatus === 'denied' ? 'denied' : 'undetermined');

      const camPermission = await CameraModule.Camera.getCameraPermissionsAsync();
      setCameraStatus(camPermission.status === 'granted' ? 'granted' : camPermission.status === 'denied' ? 'denied' : 'undetermined');

      const { status: notifStatus } = await Notifications.getPermissionsAsync();
      setNotificationStatus(notifStatus === 'granted' ? 'granted' : notifStatus === 'denied' ? 'denied' : 'undetermined');
    } catch {
      // Permissions check failed — leave as undetermined
    }
  };

  const requestPermission = useCallback(async (id: string) => {
    try {
      switch (id) {
        case 'location': {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            setLocationStatus('granted');
          } else {
            setLocationStatus('denied');
            showSettingsAlert('Location');
          }
          break;
        }
        case 'camera': {
          const result = await CameraModule.Camera.requestCameraPermissionsAsync();
          if (result.status === 'granted') {
            setCameraStatus('granted');
          } else {
            setCameraStatus('denied');
            showSettingsAlert('Camera');
          }
          break;
        }
        case 'notifications': {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status === 'granted') {
            setNotificationStatus('granted');
          } else {
            setNotificationStatus('denied');
            showSettingsAlert('Notifications');
          }
          break;
        }
      }
    } catch {
      // Permission request failed silently
    }
  }, []);

  const showSettingsAlert = (permissionName: string) => {
    Alert.alert(
      `${permissionName} Access`,
      `${permissionName} permission was denied. You can enable it later in your device settings.`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ],
    );
  };

  const handleContinue = () => {
    router.push('/(onboarding)/interests');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Enable Permissions</Text>
        <Text style={styles.subtitle}>For the best experience</Text>
      </View>

      {/* Permission cards */}
      <View style={styles.cardsContainer}>
        {PERMISSION_CARDS.map((card) => {
          const status = getStatus(card.id);
          const IconComponent = card.icon;
          const isGranted = status === 'granted';
          const isDenied = status === 'denied';

          return (
            <View key={card.id} style={styles.card}>
              <View style={styles.cardContent}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: card.accentBg }]}>
                  <IconComponent
                    size={24}
                    color={card.accentColor}
                    strokeWidth={2}
                  />
                </View>

                {/* Text */}
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                  {isDenied && (
                    <Text style={styles.deniedText}>
                      Denied — enable in Settings
                    </Text>
                  )}
                </View>

                {/* Action */}
                {isGranted ? (
                  <View style={styles.checkContainer}>
                    <Check size={20} color="#10B981" strokeWidth={2.5} />
                  </View>
                ) : (
                  <Pressable
                    onPress={() => requestPermission(card.id)}
                    style={({ pressed }) => [
                      styles.enableButton,
                      { borderColor: card.accentColor },
                      pressed && { backgroundColor: card.accentBg },
                    ]}
                  >
                    <Text style={[styles.enableButtonText, { color: card.accentColor }]}>
                      Enable
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Bottom */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>

        <Text style={styles.footnote}>
          You can change these anytime in Settings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2B',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  cardsContainer: {
    gap: 16,
    flex: 1,
  },
  card: {
    backgroundColor: '#0F2337',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
  deniedText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  checkContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B9811A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enableButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  enableButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSection: {
    gap: 12,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueButtonPressed: {
    backgroundColor: '#059669',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  footnote: {
    fontSize: 13,
    color: '#64748b',
  },
});
