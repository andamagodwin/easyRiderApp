import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';

export type PromoBannerProps = {
  onPress?: () => void;
};

export default function PromoBanner({ onPress }: PromoBannerProps) {
  return (
    <ImageBackground
      source={require('../assets/home/home-ad.png')}
      style={{ height: 200 }}
      imageStyle={{ borderRadius: 18 }}
      className="w-full rounded-2xl overflow-hidden"
      resizeMode="cover"
    >
      {/* Overlay for text readability */}
      <View className="absolute inset-0 bg-black/30 rounded-2xl" />

      <View className="flex-1 p-4 justify-between">
        <View>
          <Text className="text-white text-xl font-bold">Morning Special!</Text>
          <Text className="text-white text-4xl font-extrabold mt-1">Get 20% Off</Text>
          <Text className="text-white/90 mt-2">on All Haircuts Between 9–10 AM.</Text>
        </View>

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          className="self-start bg-white px-5 py-3 rounded-2xl"
        >
          <Text className="text-dark1 font-semibold">Book Now</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
