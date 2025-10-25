import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/auth';

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (error) {
              console.error('Sign out error:', error);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => console.log('Edit Profile')
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => console.log('Notifications')
    },
    {
      icon: 'card-outline',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      onPress: () => console.log('Payment Methods')
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => console.log('Help & Support')
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences and privacy',
      onPress: () => console.log('Settings')
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-6 border-b border-lighter">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text className="text-xl font-bold text-dark1">{user?.name || 'User'}</Text>
            <Text className="text-gray1 mt-1">{user?.email}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4 py-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className="flex-row items-center py-4 border-b border-lighter/50"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full bg-lighter items-center justify-center mr-3">
                <Ionicons name={item.icon as any} size={20} color="#235AFF" />
              </View>
              <View className="flex-1">
                <Text className="text-dark1 font-medium">{item.title}</Text>
                <Text className="text-gray1 text-sm mt-1">{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View className="px-4 py-6">
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center justify-center py-4 border border-error rounded-2xl"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text className="text-error font-medium ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}