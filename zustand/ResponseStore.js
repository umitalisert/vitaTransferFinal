import { create } from 'zustand'

const useResponseStore = create((set) => ({
    res401: false,
    resMessage: null,
    setRes401: (res401) => set(() => ({ res401: res401 })),
    setResMessage: (resMessage) => set(() => ({ resMessage: resMessage })),
}))
export default useResponseStore;