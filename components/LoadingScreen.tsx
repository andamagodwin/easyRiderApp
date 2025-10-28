import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for loading indicator
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      {/* Animated Logo */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center mb-8"
      >
        <Ionicons name="cut" size={64} color="#fff" />

        
      </Animated.View>

      {/* Loading Spinner */}
      <Animated.View
        style={{
          transform: [{ rotate: spin }],
        }}
        className="mt-8"
      >
        <View className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
      </Animated.View>

      {/* Loading Text */}
      <Animated.View style={{ opacity: fadeAnim }} className="mt-6">
      </Animated.View>

      {/* Version */}
      <View className="absolute bottom-10">
        <Text className="text-white/60 text-sm">Version 1.0.0</Text>
      </View>
    </View>
  );
}
