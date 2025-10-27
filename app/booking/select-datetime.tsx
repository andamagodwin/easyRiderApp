import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useBookingStore from '../../store/booking';
import { Container } from '../../components/Container';

type DateOption = {
  day: string;
  date: string;
  duration: string;
};

type TimeSlot = {
  time: string;
  discount?: string;
  available: boolean;
};

export default function SelectDateTime() {
  const router = useRouter();
  const { 
    salon,
    selectedServices,
    selectedStylist,
    totalDuration,
    selectedDate,
    selectedTime,
    setSelectedDateTime,
    setCurrentStep
  } = useBookingStore();

  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [activeTime, setActiveTime] = useState<string | null>(null);
  const [numberOfDays, setNumberOfDays] = useState(3);

  // Generate dates based on numberOfDays
  const generateDates = (days: number): DateOption[] => {
    const dates: DateOption[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      dates.push({
        day: dayNames[date.getDay()],
        date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        duration: `${totalDuration} mins`
      });
    }
    
    return dates;
  };

  // Generate time slots (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time12Hour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const timeString = `${time12Hour}:${minute.toString().padStart(2, '0')} ${period}`;
        
        // Add discounts to early morning slots
        const discount = hour === 9 ? '20% Off' : undefined;
        
        slots.push({
          time: timeString,
          discount,
          available: true
        });
      }
    }
    
    return slots;
  };

  const [dates, setDates] = useState(generateDates(numberOfDays));
  const [timeSlots] = useState(generateTimeSlots());

  // Initialize with stored values if they exist
  useEffect(() => {
    if (selectedDate) {
      setActiveDate(selectedDate);
    } else if (dates.length > 0) {
      // Default to first date
      setActiveDate(dates[0].date);
    }
    
    if (selectedTime) {
      setActiveTime(selectedTime);
    }
  }, [selectedDate, selectedTime, dates]);

  const handleDateSelect = (date: string) => {
    setActiveDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setActiveTime(time);
  };

  const handleLoadMoreDates = () => {
    // Load 7 more days each time
    const newNumberOfDays = numberOfDays + 7;
    setNumberOfDays(newNumberOfDays);
    setDates(generateDates(newNumberOfDays));
  };

  const handleConfirm = () => {
    if (activeDate && activeTime) {
      setSelectedDateTime(activeDate, activeTime);
      setCurrentStep('confirmation');
      
      console.log('📅 Date & Time Selected:');
      console.log('  Salon:', salon?.name);
      console.log('  Services:', selectedServices.map(s => s.name).join(', '));
      console.log('  Stylist:', selectedStylist ? selectedStylist.name : 'Any Stylist');
      console.log('  Date:', activeDate);
      console.log('  Time:', activeTime);
      console.log('  Total Duration:', totalDuration, 'mins');
      
      // Navigate to booking summary screen
      router.push('/booking/summary');
    }
  };

  const isConfirmEnabled = activeDate && activeTime;

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
          <Text className="text-2xl font-bold text-dark1">Date and time</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Select Date Section */}
          <Text className="text-xl font-bold text-dark1 mb-4">Select Date</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            <View className="flex-row">
              {dates.map((dateOption, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDateSelect(dateOption.date)}
                  className={`w-24 mr-3 p-4 rounded-2xl border-2 ${
                    activeDate === dateOption.date
                      ? 'bg-lighter border-primary'
                      : 'bg-white border-gray2/30'
                  }`}
                >
                  <Text className={`text-xs font-medium mb-1 ${
                    activeDate === dateOption.date ? 'text-primary' : 'text-gray1'
                  }`}>
                    {dateOption.day}
                  </Text>
                  <Text className={`text-base font-bold mb-1 ${
                    activeDate === dateOption.date ? 'text-dark1' : 'text-dark1'
                  }`}>
                    {dateOption.date}
                  </Text>
                  <Text className="text-xs text-gray1">{dateOption.duration}</Text>
                </TouchableOpacity>
              ))}
              
              {/* More Dates Option */}
              <TouchableOpacity 
                onPress={handleLoadMoreDates}
                className="w-20 p-4 rounded-2xl bg-white border-2 border-gray2/30 items-center justify-center"
              >
                <Ionicons name="calendar-outline" size={24} color="#235AFF" />
                <Text className="text-xs font-medium text-dark1 mt-2">More</Text>
                <Text className="text-xs text-dark1">dates</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Select Time Section */}
          <Text className="text-xl font-bold text-dark1 mb-4">Select Time</Text>

          <View className="mb-20">
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleTimeSelect(slot.time)}
                disabled={!slot.available}
                className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border-2 ${
                  activeTime === slot.time
                    ? 'bg-lighter border-primary'
                    : slot.available
                    ? 'bg-white border-gray2/30'
                    : 'bg-gray-100 border-gray2/30'
                }`}
              >
                <Text className={`text-base font-semibold ${
                  activeTime === slot.time
                    ? 'text-dark1'
                    : slot.available
                    ? 'text-dark1'
                    : 'text-gray1'
                }`}>
                  {slot.time}
                </Text>
                
                {slot.discount && (
                  <View className="bg-green-100 border border-green-300 rounded-full px-3 py-1">
                    <Text className="text-green-700 text-xs font-semibold">{slot.discount}</Text>
                  </View>
                )}

                {activeTime === slot.time && (
                  <Ionicons name="checkmark-circle" size={24} color="#235AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Fixed Confirm Button */}
        <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray2/30">
          <View className="px-4 py-4">
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!isConfirmEnabled}
              className={`py-4 rounded-2xl items-center ${
                isConfirmEnabled ? 'bg-primary' : 'bg-gray2/30'
              }`}
            >
              <Text className={`text-lg font-semibold ${
                isConfirmEnabled ? 'text-white' : 'text-gray1'
              }`}>
                Confirm Appointment
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Container>
    </SafeAreaView>
  );
}