import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFavouritesStore from '../../store/favourites';
import useAuthStore from '../../store/auth';
import SalonCard from '../../components/SalonCard';
import { Container } from '../../components/Container';

export default function Favourites() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { favourites, loading, error, loadFavourites, clearError } = useFavouritesStore();

  useEffect(() => {
    if (user) {
      loadFavourites(user.$id);
    }
  }, [user, loadFavourites]);

  const handleRefresh = () => {
    if (user) {
      loadFavourites(user.$id);
    }
  };

  const handleSalonPress = (salon: any) => {
    router.push(`/salon/${salon.id}`);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bgPrimary">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <Container>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-dark1 mb-1">My Favourites</Text>
            <Text className="text-gray1">Your saved salons</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-white rounded-xl items-center justify-center">
            <Ionicons name="heart" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-red-600 flex-1">{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
        >
          {favourites.length === 0 ? (
            <View className="items-center justify-center py-20">
              <View className="w-20 h-20 bg-lighter rounded-full items-center justify-center mb-4">
                <Ionicons name="heart-outline" size={32} color="#A0A0A0" />
              </View>
              <Text className="text-xl font-semibold text-dark1 mb-2">No favourites yet</Text>
              <Text className="text-gray1 text-center mb-6">
                Start exploring salons and add them to your favourites by tapping the heart icon
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/')}
                className="bg-primary px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Explore Salons</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="pb-6">
              {favourites.map((favourite) => {
                if (!favourite.salon) return null;
                
                return (
                  <SalonCard
                    key={favourite.salonId}
                    salon={{
                      id: favourite.salonId,
                      name: favourite.salon.name,
                      location: favourite.salon.location,
                      distance: '0.5 km', // Could calculate based on location
                      rating: favourite.salon.rating,
                      reviewCount: favourite.salon.reviewCount,
                      imageUrl: favourite.salon.imageUrl,
                    }}
                    onPress={handleSalonPress}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}