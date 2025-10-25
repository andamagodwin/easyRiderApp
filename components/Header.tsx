import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type HeaderProps = {
  location?: string;
  onLocationPress?: () => void;
  onBellPress?: () => void;
  showDot?: boolean;
};

export default function Header({
  location = 'Lakewood, California',
  onLocationPress,
  onBellPress,
  showDot = true,
}: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {/* Left: Location */}
      <TouchableOpacity onPress={onLocationPress} activeOpacity={0.7} className="flex-row items-center">
        <Ionicons name="location-outline" size={20} color="#235AFF" />
        <View className="ml-2">
          <Text className="text-gray1 text-sm">Location</Text>
          <View className="flex-row items-center">
            <Text className="text-dark1 text-xl font-semibold mr-1">{location}</Text>
            <Ionicons name="chevron-down" size={18} color="#A0A0A0" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Right: Bell */}
      <TouchableOpacity
        onPress={onBellPress}
        activeOpacity={0.7}
        className="w-11 h-11 rounded-2xl bg-lighter items-center justify-center relative"
      >
        <Ionicons name="notifications-outline" size={22} color="#0B0C15" />
        {showDot ? (
          <View className="w-2.5 h-2.5 bg-error rounded-full absolute top-1.5 right-1.5" />
        ) : null}
      </TouchableOpacity>
    </View>
  );
}
