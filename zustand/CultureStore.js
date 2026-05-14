import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCultureStore = create(
    persist(
        (set, get) => ({
            culture: 'tr',
            setCulture: (culture) => set(() => ({ culture: culture })),
        }),
        {
            name: 'main-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)


export default useCultureStore;

