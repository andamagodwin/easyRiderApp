import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SalonCard, { type Salon } from './SalonCard';

export type NearbySalonsProps = {
  salons: Salon[];
  onSalonPress?: (salon: Salon) => void;
  onViewAllPress?: () => void;
};

export default function NearbySalons({ salons, onSalonPress, onViewAllPress }: NearbySalonsProps) {
  return (
    <View>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-dark1 text-xl font-bold">Nearby Salons</Text>
        <TouchableOpacity onPress={onViewAllPress} activeOpacity={0.7} className="flex-row items-center">
          <Ionicons name="map-outline" size={18} color="#235AFF" />
          <Text className="text-primary ml-1 font-medium">View on Map</Text>
        </TouchableOpacity>
      </View>

      <View>
        {salons.map((salon) => (
          <SalonCard key={salon.id} salon={salon} onPress={onSalonPress} />
        ))}
      </View>
    </View>
  );
}