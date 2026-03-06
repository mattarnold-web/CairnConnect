import { View, Text } from 'react-native';
import { UserCircle } from 'lucide-react-native';

export interface MessageBubbleProps {
  message: string;
  senderName: string;
  senderAvatar?: string | null;
  timestamp: string;
  isCurrentUser: boolean;
  isSystemMessage?: boolean;
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function MessageBubble({
  message,
  senderName,
  senderAvatar,
  timestamp,
  isCurrentUser,
  isSystemMessage = false,
}: MessageBubbleProps) {
  // System messages (e.g. "User joined the activity")
  if (isSystemMessage) {
    return (
      <View className="items-center py-2 px-4">
        <View className="bg-cairn-elevated/50 rounded-full px-3 py-1">
          <Text className="text-slate-500 text-[11px] text-center italic">
            {message}
          </Text>
        </View>
        <Text className="text-slate-600 text-[9px] mt-0.5">
          {formatMessageTime(timestamp)}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-row px-4 py-1.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar for other users */}
      {!isCurrentUser && (
        <View className="h-7 w-7 rounded-full bg-canopy/20 items-center justify-center mr-2 mt-1">
          {senderAvatar ? (
            <Text className="text-canopy text-[10px] font-bold">
              {senderAvatar.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <UserCircle size={14} color="#10B981" />
          )}
        </View>
      )}

      <View className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {/* Sender name for other users */}
        {!isCurrentUser && (
          <Text className="text-slate-500 text-[10px] font-medium mb-0.5 ml-1">
            {senderName}
          </Text>
        )}

        {/* Message bubble */}
        <View
          className={`rounded-2xl px-3.5 py-2 ${
            isCurrentUser
              ? 'bg-canopy rounded-br-sm'
              : 'bg-cairn-card border border-cairn-border rounded-bl-sm'
          }`}
        >
          <Text
            className={`text-sm leading-5 ${
              isCurrentUser ? 'text-white' : 'text-slate-200'
            }`}
          >
            {message}
          </Text>
        </View>

        {/* Timestamp */}
        <Text className="text-slate-600 text-[9px] mt-0.5 mx-1">
          {formatMessageTime(timestamp)}
        </Text>
      </View>
    </View>
  );
}
