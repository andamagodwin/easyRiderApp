import { create } from 'zustand';
import type { Salon } from '../components/SalonCard';

interface SalonsState {
  nearbySalons: Salon[];
  setNearbySalons: (salons: Salon[]) => void;
  clearSalons: () => void;
}

const useSalonsStore = create<SalonsState>((set) => ({
  nearbySalons: [],
  setNearbySalons: (salons) => set({ nearbySalons: salons }),
  clearSalons: () => set({ nearbySalons: [] }),
}));

export default useSalonsStore;
