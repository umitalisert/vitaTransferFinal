import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMainStore = create(
    persist(
        (set, get) => ({
            pushToken: '',
            setPushToken: (token) => set(() => ({ pushToken: token })),
        }),
        {
            name: 'main-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)


export default useMainStore;

