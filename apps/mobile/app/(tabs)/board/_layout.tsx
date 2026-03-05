import { Stack } from 'expo-router';

export default function BoardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0B1A2B' },
      }}
    />
  );
}
