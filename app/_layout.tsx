import '../global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/auth';
import useLocationStore from '../store/location';
import LoadingScreen from '../components/LoadingScreen';

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, initialized, loadSession } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    initialized: s.initialized,
    loadSession: s.loadSession,
  }));
  const { getCurrentLocation } = useLocationStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Load auth session
        await loadSession();
        
        // Get user's current location
        await getCurrentLocation();
        
        // Simulate loading assets (you can add actual asset loading here)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mark as ready
        setIsReady(true);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setIsReady(true);
      }
    }

    prepare();
  }, [loadSession, getCurrentLocation]);

  useEffect(() => {
    if (!initialized || !isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [segments, isAuthenticated, initialized, isReady, router]);

  // Show loading screen until everything is ready
  if (!initialized || !isReady) {
    return <LoadingScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
