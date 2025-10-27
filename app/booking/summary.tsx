import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useBookingStore from '../../store/booking';
import { Container } from '../../components/Container';

export default function BookingSummary() {
  const router = useRouter();
  const { 
    salon,
    selectedServices,
    selectedStylist,
    selectedDate,
    selectedTime,
    totalPrice,
    totalDuration,
  } = useBookingStore();

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'salon'>('salon');

  // Calculate discount (if any)
  const discount = 3.00; // This would come from promotions/discounts
  const finalTotal = totalPrice - discount;

  const handleProceed = () => {
    console.log('💳 Processing booking...');
    console.log('Payment method:', paymentMethod);
    console.log('Total amount:', finalTotal);
    
    // TODO: Process payment and create booking in database
    // For now, navigate back to home
    router.push('/(tabs)');
  };

  if (!salon || !selectedDate || !selectedTime) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-bgPrimary">
        <Container>
          <Text className="text-center text-gray1 mt-10">No booking data found</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)')}
            className="bg-primary py-4 rounded-2xl mt-6"
          >
            <Text className="text-white text-center font-semibold">Go to Home</Text>
          </TouchableOpacity>
        </Container>
      </SafeAreaView>
    );
  }

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
          <Text className="text-2xl font-bold text-dark1">Booking summary</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Salon Card */}
          <View className="bg-white rounded-3xl p-4 mb-6 flex-row">
            <Image
              source={{ uri: salon.imageUrl || 'https://via.placeholder.com/150' }}
              className="w-40 h-40 rounded-2xl"
            />
            <View className="flex-1 ml-4 justify-center">
              <Text className="text-xl font-bold text-dark1 mb-2">{salon.name}</Text>
              <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={16} color="#9CA4AB" />
                <Text className="text-sm text-gray1 ml-1">{salon.address}, {salon.city}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#FFC107" />
                <Text className="text-sm font-semibold text-dark1 ml-1">4.7</Text>
                <Text className="text-sm text-gray1 ml-1">(312)</Text>
              </View>
              <Text className="text-sm text-gray1 mt-2">2 km</Text>
            </View>
          </View>

          {/* Booking Details */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-dark1 mb-4">Booking details</Text>
            
            {/* Date */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-dark1 mb-1">Date</Text>
              <Text className="text-base text-gray1">
                {selectedDate} at {selectedTime}
              </Text>
            </View>

            {/* Stylist */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-dark1 mb-1">Stylist</Text>
              <Text className="text-base text-gray1">
                {selectedStylist ? `${selectedStylist.name} - ${totalDuration} Mins` : `Any stylist - ${totalDuration} Mins`}
              </Text>
            </View>
          </View>

          {/* Payment Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-dark1 mb-4">Payment</Text>
            
            {/* Pay Online Now - Disabled for now */}
            <TouchableOpacity 
              disabled
              className="flex-row items-center justify-between p-4 mb-3 rounded-2xl bg-gray2/20 opacity-50"
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-dark1 mb-1">Pay Online Now</Text>
                <Text className="text-sm text-gray1">Secure your booking instantly</Text>
              </View>
              <View className="w-6 h-6 rounded-full border-2 border-gray1" />
            </TouchableOpacity>

            {/* Pay at Salon */}
            <TouchableOpacity 
              onPress={() => setPaymentMethod('salon')}
              className="flex-row items-center justify-between p-4 rounded-2xl bg-white"
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-dark1 mb-1">Pay at Salon</Text>
                <Text className="text-sm text-gray1">Settle payment after your appointment</Text>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                paymentMethod === 'salon' ? 'border-primary' : 'border-gray1'
              }`}>
                {paymentMethod === 'salon' && (
                  <View className="w-3 h-3 rounded-full bg-primary" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Pricing Details */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-dark1 mb-4">Pricing Details</Text>
            
            {/* Service Items */}
            {selectedServices.map((service, index) => (
              <View key={index} className="flex-row justify-between mb-3">
                <Text className="text-base text-gray1">{service.name}</Text>
                <Text className="text-base text-gray1">${service.price.toFixed(2)}</Text>
              </View>
            ))}

            {/* Discount */}
            {discount > 0 && (
              <View className="flex-row justify-between mb-3">
                <Text className="text-base text-gray1">Discount</Text>
                <Text className="text-base text-gray1">${discount.toFixed(2)}</Text>
              </View>
            )}

            {/* Total */}
            <View className="flex-row justify-between mt-4 pt-4 border-t border-gray2/30">
              <Text className="text-2xl font-bold text-dark1">Total</Text>
              <Text className="text-2xl font-bold text-dark1">${finalTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Spacer for button */}
          <View className="h-20" />
        </ScrollView>

        {/* Proceed Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-bgPrimary pb-6 px-6">
          <TouchableOpacity 
            onPress={handleProceed}
            className="bg-primary py-4 rounded-2xl"
          >
            <Text className="text-white text-center text-lg font-semibold">Proceed</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </SafeAreaView>
  );
}
