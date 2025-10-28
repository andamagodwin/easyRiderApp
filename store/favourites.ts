import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { databases } from '../lib/appwrite';
import { AppwriteService, type SalonDocument } from '../lib/appwrite-service';
import { ID, Query } from 'react-native-appwrite';

const DATABASE_ID = 'trimmr-db';
const FAVOURITES_COLLECTION = 'favourites';

export type FavouriteSalon = {
  $id: string;
  userId: string;
  salonId: string;
  salon?: SalonDocument;
  createdAt?: string;
};

interface FavouritesState {
  favourites: FavouriteSalon[];
  favouriteSalonIds: Set<string>;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadFavourites: (userId: string) => Promise<void>;
  addToFavourites: (userId: string, salonId: string, salonData: any) => Promise<void>;
  removeFromFavourites: (userId: string, salonId: string) => Promise<void>;
  toggleFavourite: (userId: string, salonId: string, salonData?: any) => Promise<void>;
  isFavourite: (salonId: string) => boolean;
  clearFavourites: () => void;
  clearError: () => void;
}

const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      favourites: [],
      favouriteSalonIds: new Set(),
      loading: false,
      error: null,

      loadFavourites: async (userId: string) => {
        if (get().loading) return;
        
        set({ loading: true, error: null });
        try {
          console.log('📋 Loading favourites for user:', userId);
          
          // Use AppwriteService to fetch favourites with full salon details
          const favouritesWithSalons = await AppwriteService.getUserFavourites(userId);

          console.log('✅ Loaded', favouritesWithSalons.length, 'favourites with salon details');

          const favourites: FavouriteSalon[] = favouritesWithSalons.map(fav => ({
            $id: fav.$id,
            userId: fav.userId,
            salonId: fav.salonId,
            salon: fav.salon,
            createdAt: fav.$createdAt
          }));

          const favouriteSalonIds = new Set(favourites.map(fav => fav.salonId));

          console.log('✅ Favourite salon IDs:', Array.from(favouriteSalonIds));

          set({ 
            favourites, 
            favouriteSalonIds,
            loading: false 
          });
        } catch (error: any) {
          console.error('❌ Failed to load favourites:', error);
          set({ 
            error: error?.message || 'Failed to load favourites',
            loading: false 
          });
        }
      },

      addToFavourites: async (userId: string, salonId: string, salonData: any) => {
        // Check if already in favourites
        if (get().favouriteSalonIds.has(salonId)) return;

        try {
          // Add to local state immediately for instant UI feedback
          const newFavourite: FavouriteSalon = {
            $id: ID.unique(),
            userId,
            salonId,
            salon: salonData,
            createdAt: new Date().toISOString()
          };

          set(state => ({
            favourites: [newFavourite, ...state.favourites],
            favouriteSalonIds: new Set([...state.favouriteSalonIds, salonId])
          }));

          // Add to Appwrite database
          await databases.createDocument(
            DATABASE_ID,
            FAVOURITES_COLLECTION,
            ID.unique(),
            {
              userId,
              salonId,
              salonName: salonData?.name || '',
              salonLocation: salonData?.location || '',
              salonRating: salonData?.rating || 0,
              salonReviewCount: salonData?.reviewCount || 0,
              salonImageUrl: salonData?.imageUrl || '',
              salonServices: salonData?.services || []
            }
          );

          console.log('Added to favourites:', salonId);
        } catch (error: any) {
          console.error('Failed to add to favourites:', error);
          // Revert local state on error
          set(state => ({
            favourites: state.favourites.filter(fav => fav.salonId !== salonId),
            favouriteSalonIds: new Set([...state.favouriteSalonIds].filter(id => id !== salonId)),
            error: error?.message || 'Failed to add to favourites'
          }));
        }
      },

      removeFromFavourites: async (userId: string, salonId: string) => {
        const favourite = get().favourites.find(fav => 
          fav.userId === userId && fav.salonId === salonId
        );

        if (!favourite) return;

        try {
          // Remove from local state immediately
          set(state => ({
            favourites: state.favourites.filter(fav => fav.salonId !== salonId),
            favouriteSalonIds: new Set([...state.favouriteSalonIds].filter(id => id !== salonId))
          }));

          // Get the actual document ID from Appwrite
          const response = await databases.listDocuments(
            DATABASE_ID,
            FAVOURITES_COLLECTION,
            [
              Query.equal('userId', userId),
              Query.equal('salonId', salonId),
              Query.limit(1)
            ]
          );

          if (response.documents.length > 0) {
            await databases.deleteDocument(
              DATABASE_ID,
              FAVOURITES_COLLECTION,
              response.documents[0].$id
            );
          }

          console.log('Removed from favourites:', salonId);
        } catch (error: any) {
          console.error('Failed to remove from favourites:', error);
          // Revert local state on error
          set(state => ({
            favourites: [favourite, ...state.favourites],
            favouriteSalonIds: new Set([...state.favouriteSalonIds, salonId]),
            error: error?.message || 'Failed to remove from favourites'
          }));
        }
      },

      toggleFavourite: async (userId: string, salonId: string, salonData?: any) => {
        const isFav = get().favouriteSalonIds.has(salonId);
        
        if (isFav) {
          await get().removeFromFavourites(userId, salonId);
        } else {
          await get().addToFavourites(userId, salonId, salonData);
        }
      },

      isFavourite: (salonId: string) => {
        return get().favouriteSalonIds.has(salonId);
      },

      clearFavourites: () => {
        set({
          favourites: [],
          favouriteSalonIds: new Set(),
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'favourites-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favourites: state.favourites,
        favouriteSalonIds: Array.from(state.favouriteSalonIds) // Convert Set to Array for serialization
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert Array back to Set after hydration
          state.favouriteSalonIds = new Set(state.favouriteSalonIds as any);
        }
      }
    }
  )
);

export default useFavouritesStore;