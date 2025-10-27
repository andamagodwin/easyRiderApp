import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppwriteService, type StylistDocument } from '../lib/appwrite-service';

// Types for booking process
export type BookingService = {
  $id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
};

export type BookingSalon = {
  $id: string;
  name: string;
  address: string;
  city: string;
  imageUrl?: string;
};

export type BookingStylist = StylistDocument;

export type BookingTimeSlot = {
  date: string;
  time: string;
  isAvailable: boolean;
};

export type BookingState = {
  // Current booking data
  salon: BookingSalon | null;
  selectedServices: BookingService[];
  selectedStylist: BookingStylist | null;
  selectedDate: string | null;
  selectedTime: string | null;
  totalPrice: number;
  totalDuration: number;
  
  // Step management
  currentStep: 'services' | 'stylist' | 'datetime' | 'confirmation';
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Actions
  setSalon: (salon: BookingSalon) => void;
  setSelectedServices: (services: BookingService[]) => void;
  addService: (service: BookingService) => void;
  removeService: (serviceId: string) => void;
  setSelectedStylist: (stylist: BookingStylist | null) => void;
  setSelectedDateTime: (date: string, time: string) => void;
  setCurrentStep: (step: BookingState['currentStep']) => void;
  
  // Data fetching
  loadStylists: (salonId: string, serviceIds?: string[]) => Promise<BookingStylist[]>;
  
  // Booking management
  calculateTotals: () => void;
  resetBooking: () => void;
  clearError: () => void;
};

const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // Initial state
      salon: null,
      selectedServices: [],
      selectedStylist: null,
      selectedDate: null,
      selectedTime: null,
      totalPrice: 0,
      totalDuration: 0,
      currentStep: 'services',
      loading: false,
      error: null,

      // Actions
      setSalon: (salon) => {
        set({ salon });
      },

      setSelectedServices: (services) => {
        set({ selectedServices: services });
        get().calculateTotals();
      },

      addService: (service) => {
        const { selectedServices } = get();
        const exists = selectedServices.find(s => s.$id === service.$id);
        if (!exists) {
          const newServices = [...selectedServices, service];
          set({ selectedServices: newServices });
          get().calculateTotals();
        }
      },

      removeService: (serviceId) => {
        const { selectedServices } = get();
        const newServices = selectedServices.filter(s => s.$id !== serviceId);
        set({ selectedServices: newServices });
        get().calculateTotals();
      },

      setSelectedStylist: (stylist) => {
        set({ selectedStylist: stylist });
      },

      setSelectedDateTime: (date, time) => {
        set({ selectedDate: date, selectedTime: time });
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      loadStylists: async (salonId: string, serviceIds?: string[]) => {
        try {
          set({ loading: true, error: null });
          
          console.log('📋 Booking Store: Loading stylists for salon:', salonId);
          console.log('📋 Booking Store: Service IDs to filter by:', serviceIds);
          
          const stylists = await AppwriteService.getSalonStylists(salonId, serviceIds);
          
          console.log('📋 Booking Store: Received stylists:', stylists.length);

          set({ loading: false });
          return stylists;
        } catch (error) {
          console.error('❌ Booking Store: Failed to load stylists:', error);
          set({ 
            loading: false, 
            error: 'Failed to load stylists. Please try again.' 
          });
          return [];
        }
      },

      calculateTotals: () => {
        const { selectedServices } = get();
        const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
        const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
        set({ totalPrice, totalDuration });
      },

      resetBooking: () => {
        set({
          salon: null,
          selectedServices: [],
          selectedStylist: null,
          selectedDate: null,
          selectedTime: null,
          totalPrice: 0,
          totalDuration: 0,
          currentStep: 'services',
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'booking-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        salon: state.salon,
        selectedServices: state.selectedServices,
        selectedStylist: state.selectedStylist,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        totalPrice: state.totalPrice,
        totalDuration: state.totalDuration,
        currentStep: state.currentStep
      })
    }
  )
);

export default useBookingStore;