import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export type UserLocation = {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  displayName: string; // e.g., "Lakewood, California"
};

interface LocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  
  // Actions
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  setLocation: (location: UserLocation) => void;
  clearError: () => void;
}

const DEFAULT_LOCATION: UserLocation = {
  latitude: 33.8536,
  longitude: -118.1339,
  city: 'Lakewood',
  state: 'California',
  country: 'USA',
  displayName: 'Lakewood, California',
};

const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      loading: false,
      error: null,
      permissionGranted: false,

      requestLocationPermission: async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          const granted = status === 'granted';
          set({ permissionGranted: granted });
          
          if (!granted) {
            set({ error: 'Location permission denied' });
          }
          
          return granted;
        } catch (error) {
          console.error('Error requesting location permission:', error);
          set({ error: 'Failed to request location permission' });
          return false;
        }
      },

      getCurrentLocation: async () => {
        try {
          set({ loading: true, error: null });

          // Check permission first
          const { status } = await Location.getForegroundPermissionsAsync();
          
          if (status !== 'granted') {
            const granted = await get().requestLocationPermission();
            if (!granted) {
              // Use default location if permission denied
              set({ 
                location: DEFAULT_LOCATION, 
                loading: false,
                error: null 
              });
              return;
            }
          }

          // Get current position
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          // Reverse geocode to get address
          const [address] = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          const userLocation: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: address.city || 'Unknown',
            state: address.region || address.subregion || '',
            country: address.country || 'USA',
            displayName: address.city && address.region 
              ? `${address.city}, ${address.region}`
              : address.city || 'Current Location',
          };

          console.log('📍 User location obtained:', userLocation);
          set({ location: userLocation, loading: false, permissionGranted: true });
        } catch (error: any) {
          console.error('Error getting location:', error);
          // Use default location on error
          set({ 
            location: DEFAULT_LOCATION, 
            loading: false,
            error: error?.message || 'Failed to get location'
          });
        }
      },

      setLocation: (location: UserLocation) => {
        set({ location });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'location-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        location: state.location,
        permissionGranted: state.permissionGranted,
      }),
    }
  )
);

export default useLocationStore;
