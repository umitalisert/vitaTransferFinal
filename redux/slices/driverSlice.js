import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    available: false,
}
export const driverSlice = createSlice({
    name: 'driver',
    initialState,
    reducers: {
        setAvailable: (state, action) => {
            state.available = action.payload;
        }
    },
})
export const { setAvailable } = driverSlice.actions
export default driverSlice.reducer