import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/auth';
import useBookingsStore from '../../store/bookings';
import type { BookingDocument } from '../../lib/appwrite-service';

export default function Bookings() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { bookings, loading, fetchBookings, cancelBooking } = useBookingsStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings(user.$id);
    }
  }, [user, fetchBookings]);

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await fetchBookings(user.$id);
      setRefreshing(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelBooking(bookingId);
            if (user) {
              await fetchBookings(user.$id);
            }
          },
        },
      ]
    );
  };

  const filterBookings = (status: string) => {
    return bookings.filter(booking => {
      if (status === 'upcoming') {
        // Show confirmed bookings that haven't happened yet
        return booking.bookingStatus === 'confirmed';
      } else if (status === 'completed') {
        return booking.bookingStatus === 'completed';
      } else if (status === 'cancelled') {
        return booking.bookingStatus === 'cancelled';
      }
      return false;
    });
  };

  const formatDate = (dateString: string, timeString: string) => {
    // dateString format: "Oct 28"
    // timeString format: "9:30 AM"
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [month, day] = dateString.split(' ');
    const monthIndex = months.indexOf(month);
    
    const date = new Date(2024, monthIndex, parseInt(day));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return `${dayNames[date.getDay()]}, ${dateString} - ${timeString}`;
  };

  const renderBookingCard = (booking: BookingDocument) => (
    <View key={booking.$id} className="bg-white rounded-3xl p-4 mb-4 border border-gray2/30">
      {/* Date */}
      <Text className="text-sm font-medium text-dark1 mb-4">
        {formatDate(booking.appointmentDate, booking.appointmentTime)}
      </Text>

      {/* Salon Info */}
      <View className="flex-row mb-4">
        <Image
          source={{ uri: booking.salonImageUrl || 'https://via.placeholder.com/150' }}
          className="w-24 h-24 rounded-2xl"
        />
        <View className="flex-1 ml-3 justify-center">
          <Text className="text-lg font-bold text-dark1 mb-1">{booking.salonName}</Text>
          <Text className="text-sm text-gray1 mb-2">{booking.salonAddress}</Text>
          <Text className="text-sm text-gray1">
            Services: {booking.serviceNames.join(', ')}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row">
        {activeTab === 'upcoming' && (
          <TouchableOpacity
            onPress={() => handleCancelBooking(booking.$id!)}
            className="flex-1 mr-2 py-3 px-4 rounded-2xl border-2 border-primary"
          >
            <Text className="text-primary text-center font-semibold">Cancel Booking</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={`flex-1 ${activeTab === 'upcoming' ? 'ml-2' : ''} py-3 px-4 rounded-2xl bg-primary`}
        >
          <Text className="text-white text-center font-semibold">View Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredBookings = filterBookings(activeTab);

  return (
    <SafeAreaView className="flex-1 bg-bgPrimary" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="px-6 pt-4 pb-2 bg-bgPrimary">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-4"
          >
            <Ionicons name="chevron-back" size={20} color="#0B0C15" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark1">Bookings</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-4">
          <TouchableOpacity 
            onPress={() => setActiveTab('upcoming')}
            className="mr-6"
          >
            <Text className={`text-base font-semibold pb-2 ${
              activeTab === 'upcoming' ? 'text-primary' : 'text-gray1'
            }`}>
              Upcoming
            </Text>
            {activeTab === 'upcoming' && (
              <View className="h-1 bg-primary rounded-full" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('completed')}
            className="mr-6"
          >
            <Text className={`text-base font-semibold pb-2 ${
              activeTab === 'completed' ? 'text-primary' : 'text-gray1'
            }`}>
              Completed
            </Text>
            {activeTab === 'completed' && (
              <View className="h-1 bg-primary rounded-full" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('cancelled')}
          >
            <Text className={`text-base font-semibold pb-2 ${
              activeTab === 'cancelled' ? 'text-primary' : 'text-gray1'
            }`}>
              Cancelled
            </Text>
            {activeTab === 'cancelled' && (
              <View className="h-1 bg-primary rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4">
          {loading && filteredBookings.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Text className="text-gray1 text-base">Loading bookings...</Text>
            </View>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map(renderBookingCard)
          ) : (
            <View className="items-center justify-center py-20">
              <Ionicons name="calendar-outline" size={64} color="#9CA4AB" />
              <Text className="text-gray1 text-lg mt-4">
                {activeTab === 'upcoming' && 'No upcoming bookings'}
                {activeTab === 'completed' && 'No completed bookings'}
                {activeTab === 'cancelled' && 'No cancelled bookings'}
              </Text>
              <Text className="text-gray2 text-center mt-2 px-10">
                {activeTab === 'upcoming' && 'Your upcoming appointments will appear here'}
                {activeTab === 'completed' && 'Your completed appointments will appear here'}
                {activeTab === 'cancelled' && 'Your cancelled appointments will appear here'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}