import { Stack } from 'expo-router';

export default function RecordLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B1A2B' },
      }}
    />
  );
}
