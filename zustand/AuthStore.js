
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'react-native-reanimated';


const useAuthStore = create(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            loginUser: null,
            hasError: false,
            error_description: null,
            isAgreement: false,
            setLoginUser: (loginUser) => {
                set({ loginUser: loginUser })

            },
            setIsAgreement: (isAgreement) => {
                set({ isAgreement: isAgreement })
            },
            setIsAuthenticated: (isAuthenticated) => {
                set({ isAuthenticated: isAuthenticated })
            },
            removeError: () => {
                set({ hasError: false })
            },
            logOut: () => {
                set({ isAgreement: false })
                set({ isAuthenticated: false })
                set({ loginUser: null })
                set({ hasError: false })
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),

        }
    )
)
export default useAuthStore;

























// import { create } from 'zustand'
// import Auth from '../services/remax/Auth';
// // import { persist } from 'zustand/middleware'
// import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const useAuthStore = create(
//     persist(
//         (set, get) => ({
//             isAuthenticated: false,
//             isLocationPermissionRequested: false,
//             loginUser: null,
//             login: async (request) => {
//                 Auth.Login(request).then((res) => {
//                     if (res.status == 200) {
//                         const response = res.data;
//                         if (!response.isError) {
//                             set({ isAuthenticated: true })
//                             set({ loginUser: response.result.accessToken })
//                         }
//                     }
//                 })
//             },
//             setIsLocationPermissionRequested: (locationPermission) => {
//                 set({ isLocationPermissionRequested: locationPermission })
//             },
//             signOut: () => {
//                 set({ isAuthenticated: false })
//                 set({ loginUser: null })
//             },
//         }),
//         {
//             // name: 'auth-storage',
//             // getStorage: () => AsyncStorage,
//             name: 'auth-storage',
//             storage: createJSONStorage(() => AsyncStorage),
//         }
//     )
// )


// export default useAuthStore;