import { ExpoConfig, ConfigContext } from 'expo/config';

// ---------------------------------------------------------------------------
// App Store Assets Checklist:
//   - App icon: 1024x1024 PNG (no transparency, no rounded corners)
//     Place at ./assets/icon.png
//   - Adaptive icon (Android): 1024x1024 foreground PNG with safe zone
//     Place at ./assets/adaptive-icon.png
//   - Splash screen: 1284x2778 PNG recommended
//     Place at ./assets/splash-icon.png
//   - iOS screenshots: 6.7" (1290x2796), 6.5" (1284x2778), 5.5" (1242x2208)
//   - Android screenshots: phone (1080x1920+), 7" tablet, 10" tablet
//   - Feature graphic (Android): 1024x500 PNG/JPG
// ---------------------------------------------------------------------------

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Cairn Connect',
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
    buildNumber: '1',
    infoPlist: {
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
    versionCode: 1,
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
  extra: {
    eas: {
      // TODO: Replace with your EAS project ID from `eas init`
      projectId: '',
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
  },
  experiments: {
    typedRoutes: true,
  },
});
