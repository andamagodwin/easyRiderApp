import { Stack, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import PromoBanner from '../../components/PromoBanner';
import Services, { type Service } from '../../components/Services';
import NearbySalons from '../../components/NearbySalons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { AppwriteService, type ServiceDocument, type SalonDocument } from '../../lib/appwrite-service';
import { type Salon } from '../../components/SalonCard';
import useLocationStore from '../../store/location';
import useSalonsStore from '../../store/salons';

export default function Home() {
  const router = useRouter();
  const { location } = useLocationStore();

  const handleBellPress = () => {
    router.push('/notifications');
  };

  const handleLocationPress = () => {
    router.push('/map-view');
  };

  return (
    <SafeAreaView className={styles.container} edges={['top']}>
      <Stack.Screen options={{ title: 'Home' }} />
      <Header 
        location={location?.displayName || 'Getting location...'}
        onBellPress={handleBellPress}
        onLocationPress={handleLocationPress}
      />
      <MainContent />
    </SafeAreaView>
  );
}



const styles = {
  container: 'flex flex-1 bg-white',
};

function MainContent() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [allSalons, setAllSalons] = useState<Salon[]>([]); // Store all salons
  const [salons, setSalons] = useState<Salon[]>([]); // Filtered salons to display
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>('all'); // Start with "All" selected
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location } = useLocationStore();
  const { setNearbySalons } = useSalonsStore();

  const handleSalonPress = (salon: Salon) => {
    router.push(`./salon/${salon.id}`);
  };

  const handleViewOnMap = () => {
    router.push('/map-view');
  };

  const handleServicePress = (service: Service) => {
    // Set the selected service ID
    setSelectedServiceId(service.id);

    // Update services to reflect active state
    const updatedServices = services.map(s => ({
      ...s,
      isActive: s.id === service.id
    }));
    setServices(updatedServices);

    // Filter salons based on selected service
    if (service.id === 'all') {
      // Show all salons when "All" is selected
      setSalons(allSalons);
      setNearbySalons(allSalons); // Update store for map view
      console.log('🔍 Showing all salons:', allSalons.length);
    } else {
      // Filter by specific service
      console.log('🔍 Filtering for service ID:', service.id);
      console.log('🔍 Total salons to check:', allSalons.length);
      
      const filtered = allSalons.filter(salon => {
        console.log(`  Checking salon "${salon.name}" with serviceIds:`, salon.serviceIds);
        // Check if salon offers the selected service
        const hasService = salon.serviceIds && salon.serviceIds.includes(service.id);
        console.log(`  Has service: ${hasService}`);
        return hasService;
      });
      
      setSalons(filtered);
      setNearbySalons(filtered); // Update store for map view
      console.log(`✅ Filtering salons by service: ${service.name} - Found ${filtered.length} salons`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedServiceId('all'); // Reset to "All" when location changes

        // Fetch services (not dependent on location)
        const servicesData = await AppwriteService.getServices();

        // Fetch salons based on user's city if available
        let salonsData: SalonDocument[];
        if (location?.city) {
          console.log('📍 Fetching salons for city:', location.city);
          salonsData = await AppwriteService.getSalonsByCity(location.city, 10);
        } else {
          console.log('📍 No city available, fetching all salons');
          salonsData = await AppwriteService.getSalons(10);
        }

        // Add "All" service at the beginning
        const transformedServices: Service[] = [
          {
            id: 'all',
            name: 'All',
            icon: 'grid-outline',
            isActive: true // "All" is active by default
          },
          ...servicesData.map((service: ServiceDocument) => ({
            id: service.$id,
            name: service.name,
            icon: service.icon as any,
            isActive: false
          }))
        ];

        // Transform salons data - keep reference to original salon for service filtering
        const transformedSalons = salonsData.map((salon: SalonDocument) => {
          console.log(`📋 Salon "${salon.name}" has services:`, salon.services);
          return {
            id: salon.$id,
            name: salon.name,
            location: `${salon.city}, ${salon.state}`,
            distance: location 
              ? calculateDistance(salon.latitude, salon.longitude, location.latitude, location.longitude)
              : 'N/A',
            rating: salon.rating,
            reviewCount: salon.reviewCount,
            imageUrl: salon.imageUrl,
            serviceIds: salon.services || [] // Store service IDs for filtering
          };
        });

        setServices(transformedServices);
        setAllSalons(transformedSalons);
        setSalons(transformedSalons); // Initially show all salons
        
        // Store salons for map view
        setNearbySalons(transformedSalons);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please check your connection and try again.');
        
        // Fallback to mock data on error
        setServices([
          { id: 'all', name: 'All', icon: 'grid-outline', isActive: true },
          { id: '1', name: 'Hair Cut', icon: 'cut-outline', isActive: false },
          { id: '2', name: 'Hair Styling', icon: 'brush-outline', isActive: false },
          { id: '3', name: 'Nail Art', icon: 'hand-left-outline', isActive: false },
          { id: '4', name: 'Massage', icon: 'flower-outline', isActive: false },
        ]);
        
        const mockSalons = [
          {
            id: '1',
            name: 'Hair Avenue',
            location: 'Lakewood, California',
            distance: '2 km',
            rating: 4.7,
            reviewCount: 312,
            imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop&crop=faces',
            serviceIds: []
          },
          {
            id: '2',
            name: 'Style Studio',
            location: 'Long Beach, California',
            distance: '3.5 km',
            rating: 4.5,
            reviewCount: 89,
            serviceIds: []
          },
        ];
        setAllSalons(mockSalons);
        setSalons(mockSalons);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location, setNearbySalons]);

  // Calculate distance between two points using Haversine formula
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#235AFF" />
        <Text className="text-gray1 mt-2">Loading services and salons...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {error && (
        <Section className="mb-4">
          <View className="bg-error/10 border border-error/20 rounded-2xl p-4">
            <Text className="text-error text-center">{error}</Text>
          </View>
        </Section>
      )}


      <Section className="mt-4">
        <PromoBanner />
      </Section>

      <Section className="mt-6">
        <Services services={services} onServicePress={handleServicePress} />
      </Section>

      <Section className="mt-6">
        <NearbySalons salons={salons} onSalonPress={handleSalonPress} onViewAllPress={handleViewOnMap} />
      </Section>

      <View className="h-6" />
    </ScrollView>
  );
}

function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`px-4 ${className}`}>{children}</View>;
}
