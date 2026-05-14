import { create } from 'zustand'

const useProfileStore = create((set) => ({
    change: false,
    refresh: false,
    checkLocation: false,
    setCheckLocation: (checkLocation) => set(() => ({ checkLocation: checkLocation })),
    setChange: (change) => set(() => ({ change: change })),
    setRefresh: (refresh) => set(() => ({ refresh: refresh })),
}))
export default useProfileStore;