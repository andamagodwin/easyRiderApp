import '../global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import useAuthStore from '../store/auth';

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, initialized, loadSession } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    initialized: s.initialized,
    loadSession: s.loadSession,
  }));

  useEffect(() => {
    if (!initialized) {
      loadSession();
    }
  }, [initialized, loadSession]);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [segments, isAuthenticated, initialized, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
