import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useOnlineStatus } from '@/lib/use-online-status';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <View className="bg-amber-600 px-4 py-2 flex-row items-center justify-center">
      <WifiOff size={14} color="white" />
      <Text className="text-white text-xs font-medium ml-2">
        You're offline — some features may be limited
      </Text>
    </View>
  );
}
