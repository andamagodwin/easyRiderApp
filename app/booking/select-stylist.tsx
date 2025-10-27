import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useBookingStore, { type BookingStylist } from '../../store/booking';
import { Container } from '../../components/Container';
import { AppwriteService } from '../../lib/appwrite-service';

type StylistOption = 'any' | 'multiple' | BookingStylist;

export default function SelectStylist() {
  console.log('🎯 SelectStylist component mounted');
  
  const router = useRouter();
  const { 
    salon, 
    selectedServices, 
    setSelectedStylist,
    setCurrentStep,
    loadStylists,
    loading,
    error,
    clearError
  } = useBookingStore();

  const [stylists, setStylists] = useState<BookingStylist[]>([]);
  const [selectedOption, setSelectedOption] = useState<StylistOption>('any');

  useEffect(() => {
    console.log('🔄 SelectStylist useEffect triggered');
    console.log('📍 Salon:', salon?.name || 'No salon');
    console.log('💇 Services:', selectedServices.map(s => s.name).join(', ') || 'No services');
    
    const fetchStylists = async () => {
      if (salon) {
        const serviceIds = selectedServices.map(s => s.$id);
        try {
          const fetchedStylists = await loadStylists(salon.$id, serviceIds);
          console.log('👥 Fetched stylists:', fetchedStylists.length);
          setStylists(fetchedStylists);
        } catch {
          console.log('❌ Failed to load stylists from database');
          setStylists([]);
        }
      }
    };

    fetchStylists();
  }, [salon, selectedServices, loadStylists]);

  const handleStylistSelect = (option: StylistOption) => {
    setSelectedOption(option);
    
    if (option === 'any' || option === 'multiple') {
      setSelectedStylist(null);
    } else {
      setSelectedStylist(option);
    }
  };

  const handleContinue = () => {
    setCurrentStep('datetime');
    // TODO: Navigate to date/time selection screen
    console.log('Continue to date/time selection');
    // router.push('/booking/select-datetime');
  };

  const isOptionSelected = (option: StylistOption) => {
    if (typeof option === 'string') {
      return selectedOption === option;
    }
    return selectedOption === option;
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
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-4"
          >
            <Ionicons name="chevron-back" size={20} color="#0B0C15" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark1">Choose your stylist</Text>
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

        {/* Loading State */}
        {loading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#235AFF" />
            <Text className="text-gray1 mt-4">Loading stylists...</Text>
          </View>
        )}

        {/* No Stylists Found */}
        {!loading && stylists.length === 0 && (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-lighter rounded-full items-center justify-center mb-4">
              <Ionicons name="person-outline" size={32} color="#A0A0A0" />
            </View>
            <Text className="text-xl font-semibold text-dark1 mb-2">No stylists available</Text>
            <Text className="text-gray1 text-center mb-6">
              No stylists found for the selected services. You can still book with &quot;Any Stylist&quot; option.
            </Text>
          </View>
        )}

        {!loading && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Any Stylist Option */}
            <TouchableOpacity
              onPress={() => handleStylistSelect('any')}
              className={`rounded-2xl p-4 mb-4 border-2 ${
                isOptionSelected('any')
                  ? 'bg-lighter border-primary'
                  : 'bg-white border-gray2/30'
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
                  <Ionicons name="people-outline" size={24} color="#235AFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-dark1 mb-1">Any Stylist</Text>
                  <Text className="text-gray1">Next available stylist</Text>
                </View>
                {isOptionSelected('any') && (
                  <Ionicons name="checkmark-circle" size={24} color="#235AFF" />
                )}
              </View>
            </TouchableOpacity>

            {/* Multiple Stylists Option - Only show if there are multiple stylists */}
            {stylists.length > 1 && (
              <TouchableOpacity
                onPress={() => handleStylistSelect('multiple')}
                className={`rounded-2xl p-4 mb-6 border-2 ${
                  isOptionSelected('multiple')
                    ? 'bg-lighter border-primary'
                    : 'bg-white border-gray2/30'
                }`}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
                    <Ionicons name="person-add-outline" size={24} color="#235AFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-dark1 mb-1">Multiple Stylists</Text>
                    <Text className="text-gray1">Choose per service</Text>
                  </View>
                  {isOptionSelected('multiple') && (
                    <Ionicons name="checkmark-circle" size={24} color="#235AFF" />
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Individual Stylists */}
            {stylists.map((stylist) => (
              <TouchableOpacity
                key={stylist.$id}
                onPress={() => handleStylistSelect(stylist)}
                className={`rounded-2xl p-4 mb-4 border-2 ${
                  isOptionSelected(stylist)
                    ? 'bg-lighter border-primary'
                    : 'bg-white border-gray2/30'
                }`}
              >
                <View className="flex-row items-center">
                  {/* Stylist Image */}
                  <View className="w-16 h-16 rounded-2xl overflow-hidden mr-4">
                    {stylist.imageUrl ? (
                      <Image source={{ uri: stylist.imageUrl }} className="w-full h-full" />
                    ) : (
                      <View className="w-full h-full bg-lighter items-center justify-center">
                        <Ionicons name="person-outline" size={24} color="#A0A0A0" />
                      </View>
                    )}
                  </View>

                  {/* Stylist Info */}
                  <View className="flex-1 mr-4">
                    <Text className="text-lg font-semibold text-dark1 mb-1">{stylist.name}</Text>
                    <Text className="text-gray1 text-sm mb-2">{stylist.specialty}</Text>
                    
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#FFCC00" />
                      <Text className="text-dark1 ml-1 text-sm font-medium">
                        {stylist.rating} ({stylist.reviewCount})
                      </Text>
                    </View>
                  </View>

                  {/* Top Rated Badge & Selection */}
                  <View className="items-end">
                    {stylist.isTopRated && (
                      <View className="bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1 mb-2">
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text className="text-yellow-700 text-xs font-medium ml-1">Top Rated</Text>
                        </View>
                      </View>
                    )}
                    {isOptionSelected(stylist) && (
                      <Ionicons name="checkmark-circle" size={24} color="#235AFF" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <View className="h-20" />
          </ScrollView>
        )}

        {/* Fixed Continue Button */}
        <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray2/30">
          <View className="px-4 py-4">
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-primary py-4 rounded-2xl items-center"
            >
              <Text className="text-white text-lg font-semibold">Select & Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Container>
    </SafeAreaView>
  );
}