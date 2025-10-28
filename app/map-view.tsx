import React, { useState, useRef, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import useLocationStore from '../store/location';

// Set your Mapbox access token
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiYW5kYW1hZXpyYSIsImEiOiJjbWM3djMyamcwMmxuMmxzYTFsMThpNTJwIn0.9H7kNoaCYW0Kiw0wzrLfhQ');

type MapSalon = {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  latitude: number;
  longitude: number;
};

export default function MapView() {
  const router = useRouter();
  const { location } = useLocationStore();
  const mapRef = useRef<Mapbox.MapView>(null);
  const [selectedSalon, setSelectedSalon] = useState<MapSalon | null>(null);
  const [searchLocation, setSearchLocation] = useState('Lakewood, California');

  // Use user's location or fall back to default Lakewood location
  const mapCenter = location 
    ? [location.longitude, location.latitude]
    : [-118.1339, 33.8536];

  // Update search location when user location is available
  useEffect(() => {
    if (location?.displayName) {
      setSearchLocation(location.displayName);
    }
  }, [location]);

  // Mock salon data with coordinates (replace with real data from Appwrite)
  const salons: MapSalon[] = [
    {
      id: '1',
      name: 'Hair Avenue',
      location: 'Lakewood, California',
      distance: '2 km',
      rating: 4.7,
      reviewCount: 312,
      imageUrl: 'https://via.placeholder.com/300x200',
      latitude: 33.8536,
      longitude: -118.1339,
    },
    {
      id: '2',
      name: 'Style Studio',
      location: 'Bellflower, California',
      distance: '3.5 km',
      rating: 4.5,
      reviewCount: 189,
      imageUrl: 'https://via.placeholder.com/300x200',
      latitude: 33.8817,
      longitude: -118.1170,
    },
    {
      id: '3',
      name: 'Glam Salon',
      location: 'Compton, California',
      distance: '5 km',
      rating: 4.8,
      reviewCount: 256,
      imageUrl: 'https://via.placeholder.com/300x200',
      latitude: 33.8958,
      longitude: -118.2201,
    },
    {
      id: '4',
      name: 'Beauty Lounge',
      location: 'Norwalk, California',
      distance: '4.2 km',
      rating: 4.6,
      reviewCount: 143,
      imageUrl: 'https://via.placeholder.com/300x200',
      latitude: 33.9022,
      longitude: -118.0817,
    },
    {
      id: '5',
      name: 'Chic Cuts',
      location: 'Signal Hill, California',
      distance: '6 km',
      rating: 4.9,
      reviewCount: 298,
      imageUrl: 'https://via.placeholder.com/300x200',
      latitude: 33.8047,
      longitude: -118.1678,
    },
    {
      id: '6',
      name: 'Elite Salon',
      location: 'Los Alamitos, California',
      distance: '7 km',
      rating: 4.4,
      reviewCount: 176,
      imageUrl: 'https://via.placeholder.com/300x200',
      latitude: 33.8031,
      longitude: -118.0726,
    },
    {
      id: '7',
      name: 'Urban Cuts',
      location: 'Downey, California',
      distance: '8 km',
      rating: 4.7,
      reviewCount: 234,
      imageUrl: 'https://via.placeholder.com/300x200',
      latitude: 33.9401,
      longitude: -118.1332,
    },
  ];

  const handleSalonPress = (salon: MapSalon) => {
    router.push(`/salon/${salon.id}`);
  };

  const handleMarkerPress = (salon: MapSalon) => {
    setSelectedSalon(salon);
    // Optionally center map on selected salon using camera component
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View className="px-6 py-4 bg-white">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-bgPrimary items-center justify-center mr-4"
          >
            <Ionicons name="chevron-back" size={20} color="#0B0C15" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark1">Map View</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-bgPrimary rounded-2xl px-4 py-3 mr-3">
            <Ionicons name="location" size={20} color="#235AFF" />
            <TextInput
              value={searchLocation}
              onChangeText={setSearchLocation}
              placeholder="Search location..."
              placeholderTextColor="#9CA4AB"
              className="flex-1 ml-3 text-dark1 text-base"
            />
          </View>
          <TouchableOpacity className="w-12 h-12 bg-bgPrimary rounded-2xl items-center justify-center">
            <Ionicons name="options-outline" size={24} color="#0B0C15" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <View className="flex-1">
        <Mapbox.MapView
          ref={mapRef}
          style={{ flex: 1 }}
          styleURL={Mapbox.StyleURL.Street}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Mapbox.Camera
            zoomLevel={11}
            centerCoordinate={mapCenter}
            animationMode="flyTo"
            animationDuration={2000}
          />

          {/* User Location Puck */}
          <Mapbox.LocationPuck
            pulsing={{ isEnabled: true }}
            puckBearingEnabled
            puckBearing="heading"
          />

          {/* Salon Markers */}
          {salons.map((salon) => (
            <Mapbox.PointAnnotation
              key={salon.id}
              id={`salon-${salon.id}`}
              coordinate={[salon.longitude, salon.latitude]}
              onSelected={() => handleMarkerPress(salon)}
            >
              <View className="items-center">
                <View className="w-10 h-10 bg-primary rounded-full items-center justify-center border-4 border-white shadow-lg">
                  <Ionicons name="cut" size={20} color="white" />
                </View>
              </View>
            </Mapbox.PointAnnotation>
          ))}
        </Mapbox.MapView>
      </View>

      {/* Bottom Sheet with Salons */}
      <View className="absolute bottom-0 left-0 right-0 bg-transparent">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          snapToInterval={350}
          decelerationRate="fast"
        >
          {selectedSalon ? (
            // Show only selected salon
            <View className="w-[350px] mr-4">
              <View className="bg-white rounded-3xl overflow-hidden shadow-xl">
                <Image
                  source={{ uri: selectedSalon.imageUrl }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center"
                  onPress={() => setSelectedSalon(null)}
                >
                  <Ionicons name="heart-outline" size={24} color="#0B0C15" />
                </TouchableOpacity>
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xl font-bold text-dark1 flex-1">
                      {selectedSalon.name}
                    </Text>
                    <Text className="text-gray1 text-sm">{selectedSalon.distance}</Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="location-outline" size={16} color="#9CA4AB" />
                    <Text className="text-gray1 text-sm ml-1">{selectedSalon.location}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#FFC107" />
                    <Text className="text-dark1 font-semibold ml-1">
                      {selectedSalon.rating}
                    </Text>
                    <Text className="text-gray1 ml-1">({selectedSalon.reviewCount})</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            // Show all salons
            salons.map((salon) => (
              <TouchableOpacity
                key={salon.id}
                onPress={() => handleSalonPress(salon)}
                className="w-[350px] mr-4"
              >
                <View className="bg-white rounded-3xl overflow-hidden shadow-xl">
                  <Image
                    source={{ uri: salon.imageUrl }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  <TouchableOpacity className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center">
                    <Ionicons name="heart-outline" size={24} color="#0B0C15" />
                  </TouchableOpacity>
                  <View className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-xl font-bold text-dark1 flex-1">
                        {salon.name}
                      </Text>
                      <Text className="text-gray1 text-sm">{salon.distance}</Text>
                    </View>
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="location-outline" size={16} color="#9CA4AB" />
                      <Text className="text-gray1 text-sm ml-1">{salon.location}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#FFC107" />
                      <Text className="text-dark1 font-semibold ml-1">{salon.rating}</Text>
                      <Text className="text-gray1 ml-1">({salon.reviewCount})</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
