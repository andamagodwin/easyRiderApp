import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Bookings() {

  const mockBookings = [
    {
      id: '1',
      salonName: 'Hair Avenue',
      service: 'Hair Cut',
      date: '2025-10-26',
      time: '10:00 AM',
      status: 'confirmed',
      price: '$45'
    },
    {
      id: '2',
      salonName: 'Style Studio',
      service: 'Hair Styling',
      date: '2025-10-28',
      time: '2:30 PM',
      status: 'pending',
      price: '$65'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'cancelled': return 'text-error';
      default: return 'text-gray1';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10';
      case 'pending': return 'bg-warning/10';
      case 'cancelled': return 'bg-error/10';
      default: return 'bg-gray1/10';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="px-4 py-4 border-b border-lighter">
        <Text className="text-2xl font-bold text-dark1">My Bookings</Text>
        <Text className="text-gray1 mt-1">Manage your appointments</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {mockBookings.length > 0 ? (
            mockBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                className="bg-white border border-gray2/30 rounded-2xl p-4 mb-4 shadow-sm"
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-dark1">{booking.salonName}</Text>
                    <Text className="text-gray1 text-sm mt-1">{booking.service}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${getStatusBg(booking.status)}`}>
                    <Text className={`text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#A0A0A0" />
                    <Text className="text-gray1 ml-2">{booking.date}</Text>
                    <Ionicons name="time-outline" size={16} color="#A0A0A0" className="ml-4" />
                    <Text className="text-gray1 ml-2">{booking.time}</Text>
                  </View>
                  <Text className="text-primary font-semibold">{booking.price}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-20">
              <Ionicons name="calendar-outline" size={64} color="#A0A0A0" />
              <Text className="text-gray1 text-lg mt-4">No bookings yet</Text>
              <Text className="text-gray2 text-center mt-2">Your upcoming appointments will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}