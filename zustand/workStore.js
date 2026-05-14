import { create } from 'zustand'

const useWorkStore = create((set) => ({
    workData: null,
    setWorkData: (workData) => set(() => ({ workData: workData })),
}))
export default useWorkStore;