import AsyncStorage from '@react-native-async-storage/async-storage';
import { account } from '../lib/appwrite';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AuthUser = {
  $id: string;
  email: string;
  name?: string | null;
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  // actions
  loadSession: () => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const mapUser = (u: any): AuthUser => ({ $id: u.$id, email: u.email, name: u.name });

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      initialized: false,
      loading: false,
      error: null,

      clearError: () => set({ error: null }),

      loadSession: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
          const me = await account.get();
          set({ user: mapUser(me), isAuthenticated: true, error: null });
        } catch {
          // no active session is normal on cold start
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false, initialized: true });
        }
      },

      signUp: async (email, password, name) => {
        set({ loading: true, error: null });
        try {
          // Create the user
          await account.create('unique()', email, password, name);
          // Immediately sign in
          await account.createEmailPasswordSession(email, password);
          const me = await account.get();
          set({ user: mapUser(me), isAuthenticated: true, error: null });
        } catch (e: any) {
          set({ error: e?.message || 'Sign up failed' });
          throw e;
        } finally {
          set({ loading: false, initialized: true });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          await account.createEmailPasswordSession(email, password);
          const me = await account.get();
          set({ user: mapUser(me), isAuthenticated: true, error: null });
        } catch (e: any) {
          set({ error: e?.message || 'Sign in failed' });
          throw e;
        } finally {
          set({ loading: false, initialized: true });
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          await account.deleteSession('current');
        } finally {
          set({ user: null, isAuthenticated: false, loading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
