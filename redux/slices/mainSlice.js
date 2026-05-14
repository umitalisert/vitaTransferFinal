import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    loading: false,
    hasError: false,
    errorMessage: '',
}
export const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setHasError: (state, action) => {
            state.hasError = action.payload;
        },
        setErrorMessage: (state, action) => {
            state.errorMessage = action.payload;
        },
    },
})
export const { setLoading, setHasError, setErrorMessage } = mainSlice.actions

export default mainSlice.reducer