import { client } from './appwrite';
import { Databases, Query } from 'react-native-appwrite';

const databases = new Databases(client);

// Database and Collection IDs - update these with your actual IDs
const DATABASE_ID = 'trimmr-db'; // Your database ID
const SERVICES_COLLECTION = 'services';
const SALONS_COLLECTION = 'salons';
const SALON_SERVICES_COLLECTION = 'salon_services';

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

  static async getNearbySalons(
    latitude: number,
    longitude: number,
    radiusKm = 10,
    limit = 10
  ): Promise<SalonDocument[]> {
    try {
      // Note: This is a basic implementation. For true geospatial queries,
      // you might want to implement server-side filtering or use a different approach
      const response = await databases.listDocuments(
        DATABASE_ID,
        SALONS_COLLECTION,
        [
          Query.equal('isActive', true),
          Query.orderDesc('rating'),
          Query.limit(limit * 2) // Get more to filter by distance
        ]
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