import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, MessageCircle } from 'lucide-react-native';
import { MessageBubble } from './MessageBubble';
import { fetchPostMessages, sendPostMessage } from '@/lib/api';
import type { ActivityPostMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface ChatSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export function ChatSheet({ visible, onClose, postId, postTitle }: ChatSheetProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ActivityPostMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPostMessages(postId);
      setMessages(data);
    } catch {
      // Error handled gracefully
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible) {
      loadMessages();
    }
  }, [visible, loadMessages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText('');

    try {
      const newMessage = await sendPostMessage(postId, text);
      if (newMessage) {
        setMessages((prev) => [newMessage, ...prev]);
      }
    } catch {
      // Restore input text on failure
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ActivityPostMessage }) => {
    const isCurrentUser = user?.id === item.user_id;
    // Detect system messages by checking for common patterns
    const isSystemMessage =
      !item.user_id || item.message.startsWith('[system]');

    return (
      <MessageBubble
        message={item.message.replace(/^\[system\]\s*/, '')}
        senderName={item.user_display_name ?? 'Anonymous'}
        senderAvatar={item.user_avatar}
        timestamp={item.created_at}
        isCurrentUser={isCurrentUser}
        isSystemMessage={isSystemMessage}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 border-b border-cairn-border">
            <View className="flex-1">
              <Text className="text-slate-100 font-semibold text-base" numberOfLines={1}>
                Chat
              </Text>
              <Text className="text-slate-500 text-xs" numberOfLines={1}>
                {postTitle}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center bg-cairn-elevated rounded-full px-2 py-0.5">
                <MessageCircle size={10} color="#64748b" />
                <Text className="text-slate-400 text-[10px] ml-1">
                  {messages.length}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="h-8 w-8 rounded-full bg-cairn-card items-center justify-center"
              >
                <X size={18} color="#94a3b8" />
              </Pressable>
            </View>
          </View>

          {/* Messages list */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#10B981" />
              <Text className="text-slate-500 text-xs mt-2">Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <View className="h-14 w-14 rounded-full bg-canopy/10 items-center justify-center mb-3">
                <MessageCircle size={24} color="#10B981" />
              </View>
              <Text className="text-slate-300 text-sm font-semibold mb-1">
                No messages yet
              </Text>
              <Text className="text-slate-500 text-xs text-center">
                Be the first to send a message about this activity!
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              inverted
              contentContainerStyle={{ paddingVertical: 8 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input bar */}
          <View className="border-t border-cairn-border px-4 py-3">
            <View className="flex-row items-end gap-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor="#475569"
                style={chatStyles.input}
                multiline
                maxLength={1000}
                returnKeyType="default"
                editable={!sending}
              />
              <Pressable
                onPress={handleSend}
                disabled={!inputText.trim() || sending}
                className={`h-10 w-10 rounded-full items-center justify-center ${
                  inputText.trim() && !sending
                    ? 'bg-canopy'
                    : 'bg-cairn-elevated'
                }`}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Send
                    size={16}
                    color={inputText.trim() ? 'white' : '#475569'}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const chatStyles = StyleSheet.create({
  input: {
    flex: 1,
    backgroundColor: '#112240',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: '#f1f5f9',
    maxHeight: 100,
    minHeight: 40,
  },
});
