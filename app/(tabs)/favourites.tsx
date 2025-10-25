import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Favourites() {
  const mockFavourites = [
    {
      id: '1',
      name: 'Hair Avenue',
      location: 'Lakewood, California',
      rating: 4.7,
      reviewCount: 312,
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop&crop=faces',
      services: ['Hair Cut', 'Hair Styling']
    },
    {
      id: '2',
      name: 'Nail Paradise',
      location: 'Long Beach, California',
      rating: 4.8,
      reviewCount: 158,
      services: ['Nail Art', 'Manicure']
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="px-4 py-4 border-b border-lighter">
        <Text className="text-2xl font-bold text-dark1">Favourites</Text>
        <Text className="text-gray1 mt-1">Your saved salons</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {mockFavourites.length > 0 ? (
            mockFavourites.map((salon) => (
              <TouchableOpacity
                key={salon.id}
                className="bg-white border border-gray2/30 rounded-2xl p-4 mb-4 shadow-sm"
                activeOpacity={0.7}
              >
                <View className="flex-row items-start">
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
                      <Text className="text-lg font-semibold text-dark1 flex-1 mr-2">{salon.name}</Text>
                      <TouchableOpacity className="p-1">
                        <Ionicons name="heart" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location-outline" size={14} color="#A0A0A0" />
                      <Text className="text-gray1 ml-1 text-sm">{salon.location}</Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={16} color="#FFCC00" />
                        <Text className="text-dark1 ml-1 font-medium">
                          {salon.rating} ({salon.reviewCount})
                        </Text>
                      </View>
                      <View className="flex-row flex-wrap">
                        {salon.services.slice(0, 2).map((service, index) => (
                          <View key={index} className="bg-lighter px-2 py-1 rounded-lg ml-1">
                            <Text className="text-primary text-xs">{service}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-20">
              <Ionicons name="heart-outline" size={64} color="#A0A0A0" />
              <Text className="text-gray1 text-lg mt-4">No favourites yet</Text>
              <Text className="text-gray2 text-center mt-2">Tap the heart icon on salons to save them here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}