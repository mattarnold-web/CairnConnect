import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mountain, Mail, Lock, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const { error } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          {/* Close button */}
          <Pressable
            onPress={() => router.back()}
            className="self-end mt-2 p-2"
          >
            <X size={24} color="#94a3b8" />
          </Pressable>

          {/* Logo */}
          <View className="items-center mt-8 mb-8">
            <View className="h-14 w-14 rounded-2xl bg-canopy items-center justify-center mb-3">
              <Mountain size={28} color="white" />
            </View>
            <Text className="font-bold text-xl text-slate-100">
              Cairn Connect
            </Text>
            <Text className="text-xs text-slate-500 tracking-widest uppercase mt-1">
              Find your trail
            </Text>
          </View>

          {/* Header */}
          <Text className="font-bold text-2xl text-slate-100 text-center mb-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text className="text-sm text-slate-500 text-center mb-8">
            {isSignUp
              ? 'Join the outdoor community'
              : 'Sign in to your Cairn Connect account'}
          </Text>

          {/* Social auth */}
          <Pressable className="flex-row items-center justify-center border border-cairn-border bg-cairn-card rounded-xl h-12 mb-3">
            <Text className="text-slate-300 text-sm font-medium">
              Continue with Google
            </Text>
          </Pressable>

          <Pressable className="flex-row items-center justify-center border border-cairn-border bg-cairn-card rounded-xl h-12 mb-6">
            <Text className="text-slate-300 text-sm font-medium">
              Continue with Apple
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-cairn-border" />
            <Text className="text-xs text-slate-500 mx-3">
              or continue with email
            </Text>
            <View className="flex-1 h-px bg-cairn-border" />
          </View>

          {/* Email form */}
          <View className="mb-4">
            <Text className="text-xs font-medium text-slate-400 mb-1.5">
              Email address
            </Text>
            <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-12 px-3">
              <Mail size={16} color="#64748b" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#475569"
                style={loginStyles.inputInline}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs font-medium text-slate-400 mb-1.5">
              Password
            </Text>
            <View className="flex-row items-center bg-cairn-card border border-cairn-border rounded-xl h-12 px-3">
              <Lock size={16} color="#64748b" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#475569"
                style={loginStyles.inputInline}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
              />
            </View>
          </View>

          {!isSignUp && (
            <Pressable className="self-end mb-4">
              <Text className="text-xs text-canopy">Forgot password?</Text>
            </Pressable>
          )}

          <Button onPress={handleSubmit} size="lg" loading={loading}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          <View className="flex-row items-center justify-center mt-6 mb-8">
            <Text className="text-sm text-slate-500">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <Pressable onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="text-sm text-canopy font-medium">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const loginStyles = StyleSheet.create({
  inputInline: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#f1f5f9',
  },
});
