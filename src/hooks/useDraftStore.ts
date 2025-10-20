import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Driver } from '@shared/types';
interface DraftState {
  draftedDrivers: Driver[];
  addDriver: (driver: Driver) => void;
  removeDriver: (driverId: number) => void;
  isDriverDrafted: (driverId: number) => boolean;
  reorderDrivers: (sourceIndex: number, destinationIndex: number) => void;
  clearDraft: () => void;
}
export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      draftedDrivers: [],
      addDriver: (driver) =>
        set((state) => {
          if (state.draftedDrivers.some((d) => d.id === driver.id)) {
            return state; // Already exists, do nothing
          }
          return { draftedDrivers: [...state.draftedDrivers, driver] };
        }),
      removeDriver: (driverId) =>
        set((state) => ({
          draftedDrivers: state.draftedDrivers.filter((d) => d.id !== driverId),
        })),
      isDriverDrafted: (driverId) => {
        return get().draftedDrivers.some((d) => d.id === driverId);
      },
      reorderDrivers: (sourceIndex, destinationIndex) =>
        set((state) => {
          const newDrivers = Array.from(state.draftedDrivers);
          const [removed] = newDrivers.splice(sourceIndex, 1);
          newDrivers.splice(destinationIndex, 0, removed);
          return { draftedDrivers: newDrivers };
        }),
      clearDraft: () => set({ draftedDrivers: [] }),
    }),
    {
      name: 'apexdraft-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);