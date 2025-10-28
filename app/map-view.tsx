import React, { useState, useRef, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import useLocationStore from '../store/location';
import useSalonsStore from '../store/salons';
import { AppwriteService, type SalonDocument } from '../lib/appwrite-service';

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
  const { nearbySalons } = useSalonsStore();
  const mapRef = useRef<Mapbox.MapView>(null);
  const [selectedSalon, setSelectedSalon] = useState<MapSalon | null>(null);
  const [searchLocation, setSearchLocation] = useState('Lakewood, California');
  const [salons, setSalons] = useState<MapSalon[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch salons with full data including coordinates
  useEffect(() => {
    const fetchSalonsWithCoordinates = async () => {
      try {
        setLoading(true);
        
        // Fetch salons from Appwrite with city filter if available
        let salonsData: SalonDocument[];
        if (location?.city) {
          salonsData = await AppwriteService.getSalonsByCity(location.city, 20);
        } else {
          salonsData = await AppwriteService.getSalons(20);
        }

        // Transform to MapSalon format
        const transformedSalons: MapSalon[] = salonsData.map((salon) => ({
          id: salon.$id,
          name: salon.name,
          location: `${salon.city}, ${salon.state}`,
          distance: location 
            ? calculateDistance(salon.latitude, salon.longitude, location.latitude, location.longitude)
            : 'N/A',
          rating: salon.rating,
          reviewCount: salon.reviewCount,
          imageUrl: salon.imageUrl,
          latitude: salon.latitude,
          longitude: salon.longitude,
        }));

        setSalons(transformedSalons);
      } catch (error) {
        console.error('Failed to fetch salons for map:', error);
        // If fetch fails, use data from store if available
        if (nearbySalons.length > 0) {
          // Note: These might not have coordinates, so filter them out
          const salonsWithCoords = nearbySalons.filter(s => 
            'latitude' in s && 'longitude' in s
          ) as unknown as MapSalon[];
          setSalons(salonsWithCoords);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSalonsWithCoordinates();
  }, [location, nearbySalons]);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Format distance
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

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
        {loading ? (
          <View className="flex-1 items-center justify-center bg-bgPrimary">
            <ActivityIndicator size="large" color="#235AFF" />
            <Text className="text-gray1 mt-4">Loading salons...</Text>
          </View>
        ) : (
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
                <View style={{ alignItems: 'center' }}>
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    backgroundColor: '#235AFF', 
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 4,
                    borderColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>
                    <Ionicons name="cut" size={20} color="white" />
                  </View>
                  {/* Salon Name Label */}
                  <View style={{
                    marginTop: 4,
                    backgroundColor: 'white',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: 'rgba(156, 164, 171, 0.2)',
                  }}>
                    <Text style={{ 
                      color: '#0B0C15', 
                      fontSize: 11, 
                      fontWeight: '600',
                      maxWidth: 100,
                    }} numberOfLines={1}>
                      {salon.name}
                    </Text>
                  </View>
                </View>
              </Mapbox.PointAnnotation>
            ))}
          </Mapbox.MapView>
        )}
      </View>

      {/* Bottom Sheet with Salons */}
      {!loading && salons.length > 0 && (
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
                  {selectedSalon.imageUrl ? (
                    <Image
                      source={{ uri: selectedSalon.imageUrl }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-48 bg-bgPrimary items-center justify-center">
                      <Ionicons name="storefront-outline" size={48} color="#9CA4AB" />
                    </View>
                  )}
                  <TouchableOpacity
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center"
                    onPress={() => setSelectedSalon(null)}
                  >
                    <Ionicons name="close" size={24} color="#0B0C15" />
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
                    {salon.imageUrl ? (
                      <Image
                        source={{ uri: salon.imageUrl }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-48 bg-bgPrimary items-center justify-center">
                        <Ionicons name="storefront-outline" size={48} color="#9CA4AB" />
                      </View>
                    )}
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
      )}

      {/* Empty State */}
      {!loading && salons.length === 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
          <View className="items-center py-8">
            <Ionicons name="location-outline" size={64} color="#9CA4AB" />
            <Text className="text-dark1 text-lg font-bold mt-4">No Salons Found</Text>
            <Text className="text-gray1 text-center mt-2">
              No salons available in {location?.city || 'your area'}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
