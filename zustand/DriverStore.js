import { create } from 'zustand'

const useDriverStore = create((set) => ({
    available: true,
    setAvailable: (available) => set(() => ({ available: available })),
    
}))
export default useDriverStore;