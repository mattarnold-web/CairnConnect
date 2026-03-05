import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  owner: 'marnold1218',
  name: 'Cairn Go',
  slug: 'cairn-connect',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'cairnconnect',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0B1A2B',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cairnconnect.app',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'Cairn Connect uses your location to show nearby trails and businesses, and to record your outdoor activities.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Cairn Connect uses background location to track your activities while the app is in the background.',
      NSCameraUsageDescription:
        'Cairn Connect uses the camera to capture photos during your outdoor activities.',
      NSPhotoLibraryUsageDescription:
        'Cairn Connect accesses your photo library to share activity photos.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B1A2B',
    },
    package: 'com.cairnconnect.app',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Cairn Connect uses background location to track your activities while the app is in the background.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Cairn Connect uses the camera to capture photos during your outdoor activities.',
      },
    ],
    'expo-notifications',
  ],
  updates: {
    url: 'https://u.expo.dev/51e09a5a-06f0-4b35-877d-493cd4ed6d1e',
  },
  runtimeVersion: {
    policy: 'appVersion' as const,
  },
  extra: {
    eas: {
      projectId: '51e09a5a-06f0-4b35-877d-493cd4ed6d1e',
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
  },
  experiments: {
    typedRoutes: true,
  },
});
