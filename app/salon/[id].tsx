import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppwriteService, type SalonDocument, type SalonServiceDocument } from '../../lib/appwrite-service';
import useFavouritesStore from '../../store/favourites';
import useAuthStore from '../../store/auth';
import useBookingStore from '../../store/booking';

const { width } = Dimensions.get('window');

type SalonDetailsType = SalonDocument & {
  salonServices: SalonServiceDocument[];
};

export default function SalonDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { favouriteSalonIds, toggleFavourite } = useFavouritesStore();
  const { setSalon, setSelectedServices, setCurrentStep } = useBookingStore();
  const [salon, setSalonData] = useState<SalonDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Hair Cut');
  const [localSelectedServices, setLocalSelectedServices] = useState<Set<string>>(new Set());
  
  const isFavourite = id ? favouriteSalonIds.has(id) : false;

  // Mock data for development
  const mockSalon: SalonDetailsType = useMemo(() => ({
    $id: id || '1',
    name: 'Hair Avenue',
    address: 'No 03, Kadalana Road',
    city: 'Kadalana',
    state: 'Moratuwa',
    latitude: 6.7944,
    longitude: 79.8816,
    rating: 4.7,
    reviewCount: 312,
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    phone: '+94 11 234 5678',
    description: 'Hair Avenue provides expert haircuts, styling, along with services like facials, cleanups, skincare and makeup to keep you looking your best.',
    workingHours: '9AM-10PM, Mon-Sun',
    services: [],
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop',
    ],
    isActive: true,
    salonServices: [
      { $id: '1', salonId: id || '1', name: 'Hair Cut', price: 10.00, duration: 30, category: 'Hair Cut', isActive: true },
      { $id: '2', salonId: id || '1', name: 'Hair Wash', price: 5.00, duration: 30, category: 'Hair Cut', isActive: true },
      { $id: '3', salonId: id || '1', name: 'Basic Styling', price: 15.00, duration: 45, category: 'Hair Styling', isActive: true },
      { $id: '4', salonId: id || '1', name: 'Professional Styling', price: 25.00, duration: 60, category: 'Hair Styling', isActive: true },
      { $id: '5', salonId: id || '1', name: 'Deep Treatment', price: 35.00, duration: 90, category: 'Hair Treatments', isActive: true },
      { $id: '6', salonId: id || '1', name: 'Hair + Styling Combo', price: 40.00, duration: 75, category: 'Combo', isActive: true },
    ]
  }), [id]);

  useEffect(() => {
    const loadSalonDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Load salon and its services
        const [salonData, servicesData] = await Promise.all([
          AppwriteService.getSalonById(id),
          AppwriteService.getSalonServices(id)
        ]);

        if (salonData) {
          setSalonData({
            ...salonData,
            salonServices: servicesData
          });
          
          // Set first category as default
          if (servicesData.length > 0) {
            const categories = [...new Set(servicesData.map(s => s.category))];
            setSelectedCategory(categories[0]);
          }
        } else {
          // Fallback to mock data for development
          setSalonData(mockSalon);
        }
      } catch (error) {
        console.error('Failed to load salon details:', error);
        setSalonData(mockSalon); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    loadSalonDetails();
  }, [id, mockSalon]);

  const categories = salon ? [...new Set(salon.salonServices.map(s => s.category))] : [];
  const filteredServices = salon ? salon.salonServices.filter(s => s.category === selectedCategory) : [];

  const handleServiceToggle = (serviceId: string) => {
    setLocalSelectedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleContinue = () => {
    if (localSelectedServices.size > 0 && salon) {
      // Prepare salon data for booking store
      const bookingSalon = {
        $id: salon.$id,
        name: salon.name,
        address: salon.address,
        city: salon.city,
        imageUrl: salon.imageUrl
      };

      // Prepare selected services data for booking store
      const selectedServiceDetails = salon.salonServices
        .filter(s => localSelectedServices.has(s.$id))
        .map(s => ({
          $id: s.$id,
          name: s.name,
          price: s.price,
          duration: s.duration,
          category: s.category
        }));

      console.log('🏢 Salon:', bookingSalon.name);
      console.log('💇 Services:', selectedServiceDetails.map(s => s.name).join(', '));
      console.log('💰 Total Price:', selectedServiceDetails.reduce((sum, s) => sum + s.price, 0));

      // Update booking store
      setSalon(bookingSalon);
      setSelectedServices(selectedServiceDetails);
      setCurrentStep('stylist');
      console.log('📦 Booking store updated');

      // Navigate to stylist selection
      console.log('Navigate to stylist selection');
      
      // Use the exact path as shown in the type system
      router.push('/booking/select-stylist' as any);
      console.log('✅ Navigation triggered');
    }
  };

  if (loading || !salon) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray1">Loading salon details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="relative rounded-xl">
          <Image 
            source={{ uri: salon.imageUrl }} 
            style={{ width, height: 250 }}
            resizeMode="cover"
          />
          
          {/* Header Overlay */}
          <View className="absolute top-4 left-0 right-0 flex-row justify-between items-center px-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white items-center justify-center"
            >
              <Ionicons name="chevron-back" size={24} color="#0B0C15" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                if (user && id && salon) {
                  toggleFavourite(user.$id, id, {
                    name: salon.name,
                    location: `${salon.address}, ${salon.city}`,
                    rating: salon.rating,
                    reviewCount: salon.reviewCount,
                    imageUrl: salon.imageUrl,
                    services: categories
                  });
                }
              }}
              className="w-10 h-10 rounded-full bg-white items-center justify-center"
            >
              <Ionicons 
                name={isFavourite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavourite ? "#FF3B30" : "#0B0C15"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 py-4">
          {/* Salon Info */}
          <Text className="text-2xl font-bold text-dark1 mb-2">{salon.name}</Text>
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color="#A0A0A0" />
            <Text className="text-gray1 ml-1">{salon.address}, {salon.city}, {salon.state}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={16} color="#A0A0A0" />
            <Text className="text-gray1 ml-1">{salon.workingHours}</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="star" size={16} color="#FFCC00" />
            <Text className="text-dark1 ml-1 font-medium">
              {salon.rating} ({salon.reviewCount})
            </Text>
          </View>

          {/* Description */}
          <Text className="text-gray1 mb-6 leading-6">{salon.description}</Text>

          {/* Service Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`mr-3 px-4 py-2 rounded-2xl ${
                  selectedCategory === category ? 'bg-primary' : 'bg-lighter border border-gray2'
                }`}
                style={{ marginRight: index === categories.length - 1 ? 16 : 12 }}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory === category ? 'text-white' : 'text-dark1'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Services List */}
          <View>
            {filteredServices.map((service) => (
              <View key={service.$id} className="flex-row items-center justify-between py-4 border-b border-lighter/50">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-dark1">{service.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-dark1 font-bold">${service.price.toFixed(2)}</Text>
                    <View className="flex-row items-center ml-4">
                      <Ionicons name="time-outline" size={14} color="#A0A0A0" />
                      <Text className="text-gray1 ml-1">{service.duration} Mins</Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleServiceToggle(service.$id)}
                  className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                    localSelectedServices.has(service.$id) 
                      ? 'bg-primary border-primary' 
                      : 'border-primary'
                  }`}
                >
                  <Ionicons 
                    name={localSelectedServices.has(service.$id) ? "checkmark" : "add"} 
                    size={18} 
                    color={localSelectedServices.has(service.$id) ? "#FFFFFF" : "#235AFF"} 
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Fixed Continue Button at Bottom */}
      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray2/30">
        <View className="px-4 py-4">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={localSelectedServices.size === 0}
            className={`flex-row items-center justify-center py-4 rounded-2xl ${
              localSelectedServices.size > 0 
                ? 'bg-primary' 
                : 'bg-gray2/30'
            }`}
          >
            <Text className={`text-lg font-semibold mr-2 ${
              localSelectedServices.size > 0 
                ? 'text-white' 
                : 'text-gray1'
            }`}>
              Continue
            </Text>
            {localSelectedServices.size > 0 && (
              <View className="bg-white/20 rounded-full px-2 py-1 min-w-[24px] items-center">
                <Text className="text-white text-sm font-bold">
                  {localSelectedServices.size}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}