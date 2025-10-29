import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFavouritesStore from '../store/favourites';
import useAuthStore from '../store/auth';

export type Salon = {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  serviceIds?: string[]; // Optional service IDs for filtering
};

export type SalonCardProps = {
  salon: Salon;
  onPress?: (salon: Salon) => void;
};

export default function SalonCard({ salon, onPress }: SalonCardProps) {
  const { favouriteSalonIds, toggleFavourite } = useFavouritesStore();
  const { user } = useAuthStore();
  const isFavourite = favouriteSalonIds.has(salon.id);

  const handleHeartPress = () => {
    if (user) {
      toggleFavourite(user.$id, salon.id, salon);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(salon)}
      activeOpacity={0.7}
      className="bg-white rounded-2xl p-4 mb-3 flex-row"
    >
      {/* Salon Image */}
      <View className="w-16 h-16 rounded-2xl bg-lighter mr-3 overflow-hidden">
        {salon.imageUrl ? (
          <Image source={{ uri: salon.imageUrl }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full bg-lighter items-center justify-center">
            <Ionicons name="storefront-outline" size={24} color="#A0A0A0" />
          </View>
        )}
      </View>

      {/* Salon Info */}
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-dark1 text-lg font-semibold flex-1 mr-2">{salon.name}</Text>
          <View className="flex-row items-center">
            <Text className="text-gray1 text-sm mr-2">{salon.distance}</Text>
            <TouchableOpacity onPress={handleHeartPress} activeOpacity={0.7}>
              <Ionicons 
                name={isFavourite ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavourite ? "#FF4444" : "#A0A0A0"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={14} color="#A0A0A0" />
          <Text className="text-gray1 ml-1 text-sm">{salon.location}</Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="star" size={16} color="#FFCC00" />
          <Text className="text-dark1 ml-1 font-medium">
            {salon.rating} ({salon.reviewCount})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}