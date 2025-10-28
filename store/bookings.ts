import { create } from 'zustand';
import { AppwriteService, type BookingDocument } from '../lib/appwrite-service';

export type BookingState = {
  bookings: BookingDocument[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchBookings: (userId: string) => Promise<void>;
  addBooking: (booking: BookingDocument) => void;
  updateBookingStatus: (bookingId: string, status: string) => void;
  cancelBooking: (bookingId: string) => Promise<void>;
  refreshBookings: (userId: string) => Promise<void>;
  clearError: () => void;
};

const useBookingsStore = create<BookingState>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchBookings: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      console.log('📋 Fetching bookings for user:', userId);
      
      const bookings = await AppwriteService.getUserBookings(userId);
      
      console.log('✅ Fetched bookings:', bookings.length);
      set({ bookings, loading: false });
    } catch (error) {
      console.error('❌ Failed to fetch bookings:', error);
      set({ 
        loading: false, 
        error: 'Failed to load bookings. Please try again.' 
      });
    }
  },

  addBooking: (booking: BookingDocument) => {
    const { bookings } = get();
    set({ bookings: [booking, ...bookings] });
  },

  updateBookingStatus: (bookingId: string, status: string) => {
    const { bookings } = get();
    const updatedBookings = bookings.map(booking =>
      booking.$id === bookingId
        ? { ...booking, bookingStatus: status }
        : booking
    );
    set({ bookings: updatedBookings });
  },

  cancelBooking: async (bookingId: string) => {
    try {
      set({ loading: true, error: null });
      
      // TODO: Call API to cancel booking
      // For now, just update local state
      get().updateBookingStatus(bookingId, 'cancelled');
      
      set({ loading: false });
    } catch (error) {
      console.error('❌ Failed to cancel booking:', error);
      set({ 
        loading: false, 
        error: 'Failed to cancel booking. Please try again.' 
      });
    }
  },

  refreshBookings: async (userId: string) => {
    await get().fetchBookings(userId);
  },

  clearError: () => {
    set({ error: null });
  }
}));

export default useBookingsStore;
