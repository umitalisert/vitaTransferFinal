import { configureStore } from '@reduxjs/toolkit'
import mainReducer from './slices/mainSlice'
import driverReducer from './slices/driverSlice'
export const store = configureStore({
  reducer: {
    main: mainReducer,
    driver: driverReducer,
  },
})

