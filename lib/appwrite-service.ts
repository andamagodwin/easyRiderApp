import { client } from './appwrite';
import { Databases, Query } from 'react-native-appwrite';

const databases = new Databases(client);

// Database and Collection IDs - update these with your actual IDs
const DATABASE_ID = 'trimmr-db'; // Your database ID
const SERVICES_COLLECTION = 'services';
const SALONS_COLLECTION = 'salons';
const SALON_SERVICES_COLLECTION = 'salon_services';
const STYLISTS_COLLECTION = 'stylists';
const BOOKINGS_COLLECTION = 'bookings';
const FAVOURITES_COLLECTION = 'favourites';

export type ServiceDocument = {
  $id: string;
  name: string;
  icon: string;
  isActive?: boolean;
  order?: number;
};

export type SalonDocument = {
  $id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  phone?: string;
  description?: string;
  services: string[]; // Array of service IDs
  workingHours?: string;
  images?: string[]; // Additional images
  isActive: boolean;
};

export type SalonServiceDocument = {
  $id: string;
  salonId: string;
  name: string;
  price: number;
  duration: number; // in minutes
  category: string;
  description?: string;
  isActive: boolean;
};

export type StylistDocument = {
  $id: string;
  salonId: string;
  name: string;
  specialty: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  isTopRated: boolean;
  availableServices: string[]; // Array of service IDs this stylist can perform
  workingHours?: string; // JSON string of working schedule
  isActive: boolean;
};

export type BookingDocument = {
  $id?: string;
  userId: string;
  salonId: string;
  salonName: string;
  salonAddress?: string;
  salonImageUrl?: string;
  stylistId?: string;
  stylistName?: string;
  serviceIds: string[];
  serviceNames: string[];
  servicePrices: number[];
  appointmentDate: string;
  appointmentTime: string;
  totalPrice: number;
  totalDuration: number;
  discount?: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  notes?: string;
};

export type FavouriteDocument = {
  $id: string;
  userId: string;
  salonId: string;
  $createdAt?: string;
};

export type FavouriteWithSalon = FavouriteDocument & {
  salon: SalonDocument;
};

export class AppwriteService {
  // Services
  static async getServices(): Promise<ServiceDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SERVICES_COLLECTION,
        [Query.orderAsc('order'), Query.limit(20)]
      );
      return response.documents as unknown as ServiceDocument[];
    } catch (error) {
      console.error('Failed to fetch services:', error);
      return [];
    }
  }

  // Salons
  static async getSalons(limit = 10): Promise<SalonDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SALONS_COLLECTION,
        [
          Query.equal('isActive', true),
          Query.orderDesc('rating'),
          Query.limit(limit)
        ]
      );
      return response.documents as unknown as SalonDocument[];
    } catch (error) {
      console.error('Failed to fetch salons:', error);
      return [];
    }
  }

  static async getSalonsByCity(city: string, limit = 10): Promise<SalonDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SALONS_COLLECTION,
        [
          Query.equal('isActive', true),
          Query.equal('city', city),
          Query.orderDesc('rating'),
          Query.limit(limit)
        ]
      );
      return response.documents as unknown as SalonDocument[];
    } catch (error) {
      console.error('Failed to fetch salons by city:', error);
      return [];
    }
  }

  static async getNearbySalons(
    latitude: number,
    longitude: number,
    radiusKm = 10,
    limit = 10,
    city?: string
  ): Promise<SalonDocument[]> {
    try {
      // Note: This is a basic implementation. For true geospatial queries,
      // you might want to implement server-side filtering or use a different approach
      const queries = [
        Query.equal('isActive', true),
        Query.orderDesc('rating'),
        Query.limit(limit * 2) // Get more to filter by distance
      ];

      // Add city filter if provided
      if (city) {
        queries.push(Query.equal('city', city));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        SALONS_COLLECTION,
        queries
      );

      const salons = response.documents as unknown as SalonDocument[];
      
      // Calculate distance and filter
      const salonsWithDistance = salons.map(salon => ({
        ...salon,
        distance: this.calculateDistance(latitude, longitude, salon.latitude, salon.longitude)
      })).filter(salon => salon.distance <= radiusKm);

      // Sort by distance and limit
      return salonsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch nearby salons:', error);
      return [];
    }
  }

  // Salon Services
  static async getSalonServices(salonId: string): Promise<SalonServiceDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SALON_SERVICES_COLLECTION,
        [
          Query.equal('salonId', salonId),
          Query.equal('isActive', true),
          Query.orderAsc('category')
        ]
      );
      return response.documents as unknown as SalonServiceDocument[];
    } catch (error) {
      console.error('Failed to fetch salon services:', error);
      return [];
    }
  }

  static async getSalonById(salonId: string): Promise<SalonDocument | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        SALONS_COLLECTION,
        salonId
      );
      return response as unknown as SalonDocument;
    } catch (error) {
      console.error('Failed to fetch salon details:', error);
      return null;
    }
  }

  // Stylists
  static async getSalonStylists(salonId: string, serviceIds?: string[]): Promise<StylistDocument[]> {
    try {
      console.log('🔍 Querying stylists for salon:', salonId);
      console.log('🔍 With service IDs:', serviceIds);

      let queries = [
        Query.equal('salonId', salonId),
        Query.equal('isActive', true),
        Query.orderDesc('isTopRated'), // Top rated stylists first
        Query.orderDesc('rating')
      ];

      // If specific services are selected, filter stylists who can perform them
      if (serviceIds && serviceIds.length > 0) {
        console.log('🔍 Adding service filter for:', serviceIds);
        // Find stylists who have at least one of the required services
        queries.push(Query.contains('availableServices', serviceIds));
      }

      console.log('🔍 Final queries:', queries);

      const response = await databases.listDocuments(
        DATABASE_ID,
        STYLISTS_COLLECTION,
        queries
      );

      console.log('🔍 Database response:', response);
      console.log('🔍 Found stylists:', response.documents.length);
      
      // If no stylists found with service filter, try without service filter
      if (response.documents.length === 0 && serviceIds && serviceIds.length > 0) {
        console.log('🔍 No stylists found with service filter, trying without filter...');
        
        const fallbackQueries = [
          Query.equal('salonId', salonId),
          Query.equal('isActive', true),
          Query.orderDesc('isTopRated'),
          Query.orderDesc('rating')
        ];

        const fallbackResponse = await databases.listDocuments(
          DATABASE_ID,
          STYLISTS_COLLECTION,
          fallbackQueries
        );

        console.log('🔍 Fallback query found stylists:', fallbackResponse.documents.length);
        
        if (fallbackResponse.documents.length > 0) {
          console.log('🔍 First fallback stylist example:', {
            name: fallbackResponse.documents[0].name,
            salonId: fallbackResponse.documents[0].salonId,
            availableServices: fallbackResponse.documents[0].availableServices
          });
        }

        return fallbackResponse.documents as unknown as StylistDocument[];
      }
      
      if (response.documents.length > 0) {
        console.log('🔍 First stylist example:', {
          name: response.documents[0].name,
          salonId: response.documents[0].salonId,
          availableServices: response.documents[0].availableServices
        });
      }

      return response.documents as unknown as StylistDocument[];
    } catch (error) {
      console.error('❌ Failed to fetch salon stylists:', error);
      return [];
    }
  }

  static async getStylistById(stylistId: string): Promise<StylistDocument | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        STYLISTS_COLLECTION,
        stylistId
      );
      return response as unknown as StylistDocument;
    } catch (error) {
      console.error('Failed to fetch stylist details:', error);
      return null;
    }
  }

  // Debug helper to test if stylists exist for a salon (without service filtering)
  static async getAllSalonStylists(salonId: string): Promise<StylistDocument[]> {
    try {
      console.log('🔧 DEBUG: Getting ALL stylists for salon:', salonId);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        STYLISTS_COLLECTION,
        [
          Query.equal('salonId', salonId),
          Query.orderDesc('isTopRated'),
          Query.orderDesc('rating')
        ]
      );

      console.log('🔧 DEBUG: Total stylists (including inactive):', response.documents.length);
      
      if (response.documents.length > 0) {
        response.documents.forEach((doc, index) => {
          console.log(`🔧 DEBUG: Stylist ${index + 1}:`, {
            name: doc.name,
            salonId: doc.salonId,
            isActive: doc.isActive,
            availableServices: doc.availableServices
          });
        });
      }

      return response.documents as unknown as StylistDocument[];
    } catch (error) {
      console.error('🔧 DEBUG: Failed to fetch all salon stylists:', error);
      return [];
    }
  }

  // Bookings
  static async createBooking(bookingData: Omit<BookingDocument, '$id'>): Promise<BookingDocument> {
    try {
      console.log('📝 Creating booking with data:', bookingData);
      
      const response = await databases.createDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION,
        'unique()', // Let Appwrite generate a unique ID
        bookingData
      );
      
      console.log('✅ Booking created successfully:', response.$id);
      return response as unknown as BookingDocument;
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      throw error;
    }
  }

  static async getUserBookings(userId: string): Promise<BookingDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BOOKINGS_COLLECTION,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );
      return response.documents as unknown as BookingDocument[];
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      return [];
    }
  }

  static async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    try {
      console.log('📝 Updating booking status:', bookingId, 'to', status);
      
      await databases.updateDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION,
        bookingId,
        { bookingStatus: status }
      );
      
      console.log('✅ Booking status updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to update booking status:', error);
      throw error;
    }
  }

  // Favourites
  static async getUserFavourites(userId: string): Promise<FavouriteWithSalon[]> {
    try {
      console.log('📋 Fetching favourites for user:', userId);
      
      // First, get the user's favourite records
      const favouritesResponse = await databases.listDocuments(
        DATABASE_ID,
        FAVOURITES_COLLECTION,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );

      console.log('✅ Found', favouritesResponse.documents.length, 'favourite records');

      const favourites = favouritesResponse.documents as unknown as FavouriteDocument[];

      // Fetch full salon details for each favourite
      const favouritesWithSalons: FavouriteWithSalon[] = [];

      for (const favourite of favourites) {
        try {
          const salon = await databases.getDocument(
            DATABASE_ID,
            SALONS_COLLECTION,
            favourite.salonId
          );

          favouritesWithSalons.push({
            ...favourite,
            salon: salon as unknown as SalonDocument
          });
        } catch (error) {
          console.warn(`⚠️ Could not fetch salon ${favourite.salonId}:`, error);
          // Skip this favourite if salon doesn't exist or can't be fetched
        }
      }

      console.log('✅ Loaded', favouritesWithSalons.length, 'favourites with salon details');
      return favouritesWithSalons;
    } catch (error) {
      console.error('❌ Failed to fetch user favourites:', error);
      return [];
    }
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}