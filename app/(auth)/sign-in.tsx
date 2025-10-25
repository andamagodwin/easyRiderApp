import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import useAuthStore from '../../store/auth';

export default function SignIn() {
  const router = useRouter();
  const { signIn, loading, error, clearError } = useAuthStore((s) => ({
    signIn: s.signIn,
    loading: s.loading,
    error: s.error,
    clearError: s.clearError,
  }));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    clearError();
    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch {}
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-lighter" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 px-6 justify-center">
        <Text className="text-3xl font-bold text-dark1 mb-8">Welcome back</Text>

        {error ? (
          <Text className="text-error mb-4">{error}</Text>
        ) : null}

        <View className="gap-4">
          <View>
            <Text className="text-dark2 mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              className="bg-white border border-gray2 rounded px-4 py-3 text-dark1"
            />
          </View>

          <View>
            <Text className="text-dark2 mb-2">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              className="bg-white border border-gray2 rounded px-4 py-3 text-dark1"
            />
          </View>

          <TouchableOpacity onPress={onSubmit} disabled={loading} className="bg-primary rounded py-3 mt-2 items-center">
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Sign in</Text>}
          </TouchableOpacity>

          <View className="flex-row gap-1 mt-4">
            <Text className="text-dark2">Don’t have an account?</Text>
            <Link href="./sign-up" className="text-info">Sign up</Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
