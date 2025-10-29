import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '../components/Container';

type NotificationType = 'booking' | 'promotion' | 'reminder' | 'system';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  imageUrl?: string;
};

export default function Notifications() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Mock notifications - replace with real data from Appwrite later
  // Start with empty array to show empty state by default
  const [notifications, setNotifications] = useState<Notification[]>([
    // Uncomment below for testing with sample data
    // {
    //   id: '1',
    //   type: 'booking',
    //   title: 'Booking Confirmed',
    //   message: 'Your appointment at Hair Avenue for Oct 28 at 9:30 AM has been confirmed.',
    //   time: '2 hours ago',
    //   read: false,
    //   imageUrl: 'https://via.placeholder.com/50'
    // },
  ]);

  const getIconName = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'booking':
        return 'calendar';
      case 'promotion':
        return 'pricetag';
      case 'reminder':
        return 'alarm';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: NotificationType): string => {
    switch (type) {
      case 'booking':
        return '#235AFF';
      case 'promotion':
        return '#FF6B6B';
      case 'reminder':
        return '#FFA500';
      case 'system':
        return '#9CA4AB';
      default:
        return '#235AFF';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <Container>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-4"
            >
              <Ionicons name="chevron-back" size={20} color="#0B0C15" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-dark1">Notifications</Text>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity 
              onPress={markAllAsRead}
              className="px-4 py-2 bg-primary/10 rounded-xl"
            >
              <Text className="text-primary font-semibold text-sm">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row mb-4">
          <TouchableOpacity 
            onPress={() => setActiveTab('all')}
            className="mr-6"
          >
            <Text className={`text-base font-semibold pb-2 ${
              activeTab === 'all' ? 'text-primary' : 'text-gray1'
            }`}>
              All
            </Text>
            {activeTab === 'all' && (
              <View className="h-1 bg-primary rounded-full" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('unread')}
            className="flex-row items-center"
          >
            <Text className={`text-base font-semibold pb-2 ${
              activeTab === 'unread' ? 'text-primary' : 'text-gray1'
            }`}>
              Unread
            </Text>
            {unreadCount > 0 && (
              <View className="ml-2 mb-2 w-5 h-5 bg-primary rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{unreadCount}</Text>
              </View>
            )}
            {activeTab === 'unread' && (
              <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="pb-6">
            {filteredNotifications.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="w-24 h-24 bg-bgPrimary rounded-full items-center justify-center mb-4">
                  <Ionicons 
                    name={activeTab === 'unread' && notifications.length > 0 ? "checkmark-done" : "notifications-outline"} 
                    size={40} 
                    color="#235AFF" 
                  />
                </View>
                <Text className="text-xl font-bold text-dark1 mb-2">
                  {notifications.length === 0 
                    ? 'No Notifications Yet'
                    : activeTab === 'all' 
                      ? 'No notifications' 
                      : 'All Caught Up!'}
                </Text>
                <Text className="text-gray1 text-center px-8">
                  {notifications.length === 0 
                    ? 'You don\'t have any notifications yet. We\'ll notify you about booking confirmations, promotions, and updates.'
                    : activeTab === 'all' 
                      ? 'You\'re all caught up! Check back later for updates.'
                      : 'You\'ve read all your notifications. Great job staying on top of things!'}
                </Text>
              </View>
            ) : (
              filteredNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => markAsRead(notification.id)}
                  className={`flex-row p-4 mb-3 rounded-2xl border ${
                    notification.read 
                      ? 'bg-white border-gray2/30' 
                      : 'bg-lighter border-primary/30'
                  }`}
                >
                  {/* Icon or Image */}
                  <View className="mr-3">
                    {notification.imageUrl ? (
                      <Image 
                        source={{ uri: notification.imageUrl }}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <View className={`w-12 h-12 rounded-full items-center justify-center`}
                        style={{ backgroundColor: `${getIconColor(notification.type)}15` }}
                      >
                        <Ionicons 
                          name={getIconName(notification.type)} 
                          size={24} 
                          color={getIconColor(notification.type)} 
                        />
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text className="text-base font-bold text-dark1 flex-1">
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />
                      )}
                    </View>
                    <Text className="text-sm text-gray1 mb-2" numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-gray2">{notification.time}</Text>
                      <TouchableOpacity 
                        onPress={() => deleteNotification(notification.id)}
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={16} color="#9CA4AB" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}
